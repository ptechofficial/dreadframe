import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server";
import {
  GenerateHorrorConceptsBody,
  GenerateHorrorConceptsResponse,
  GenerateStoryBibleBody,
  GenerateStoryBibleResponse,
  GenerateCharacterBody,
  GenerateCharacterResponse,
  GenerateCharacterArcBody,
  GenerateCharacterArcResponse,
  GenerateSequencesBody,
  GenerateSequencesResponse,
  GenerateShotsBody,
  GenerateShotsResponse,
  GenerateEndingsBody,
  GenerateEndingsResponse,
  ApplyDirectorActionBody,
  ApplyDirectorActionResponse,
  GenerateImageBody,
  GenerateImageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Rate limiting: 30 text-generation requests per 15 minutes per IP
const textGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many generation requests. Please wait before trying again." },
});

// Rate limiting: 10 image-generation requests per 15 minutes per IP
const imageGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many image generation requests. Please wait before trying again." },
});

// Apply rate limiting — body size is already capped at 64KB by the Express parser
router.use("/generate", textGenLimiter);
router.use("/generate/image", imageGenLimiter);

// System prompt for all DREADFRAME generation
const SYSTEM_PROMPT = `You are the DREADFRAME AI Director — an expert horror story architect, character psychologist, and cinematic director. You specialize in A24-style psychological horror: restrained, atmospheric, intelligent. Your output is always structured JSON. Never break character. Never add commentary outside the JSON structure. Generate content that is genuinely unsettling, atmospheric, and cinematic — not cheesy or clichéd.`;

async function generateJSON(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.6-terra",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");
  return JSON.parse(content);
}

// POST /generate/horror-concepts
router.post("/generate/horror-concepts", async (req, res): Promise<void> => {
  const parsed = GenerateHorrorConceptsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, mode, preferredGenres } = parsed.data;
  const genresHint = preferredGenres?.length
    ? `The user is interested in: ${preferredGenres.join(", ")}.`
    : "";

  const userPrompt = `Generate exactly 6 horror concepts in JSON format.

Input mode: ${mode}
User input: "${prompt}"
${genresHint}

Each concept must be genuinely terrifying and original. Draw from psychological horror, body horror, cosmic horror, folk horror, analog horror, liminal horror, and similar subgenres. Avoid clichés.

Return JSON: { "concepts": [ { "id": "unique-id-1", "title": "...", "genre": "...", "premise": "one sentence", "centralFear": "...", "visualTone": "...", "narrativeHook": "..." }, ... ] }`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateHorrorConceptsResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for horror-concepts");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate horror concepts");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/story-bible
router.post("/generate/story-bible", async (req, res): Promise<void> => {
  const parsed = GenerateStoryBibleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { concept, userPrompt: extraPrompt } = parsed.data;

  const userPrompt = `Create a full Story Bible for this horror concept.

Concept: ${concept.title}
Genre: ${concept.genre}
Premise: ${concept.premise}
Central Fear: ${concept.centralFear}
Visual Tone: ${concept.visualTone}
Narrative Hook: ${concept.narrativeHook}
${extraPrompt ? `Additional context: ${extraPrompt}` : ""}

Return JSON: { "premise": "one paragraph", "theme": "emotional theme", "centralFear": "primal fear", "horrorRule": "the supernatural/psychological rule", "stakes": "what can be lost", "mystery": "the central question", "reveal": "what the protagonist discovers", "logline": "one sentence logline" }`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateStoryBibleResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for story-bible");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate story bible");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/character
router.post("/generate/character", async (req, res): Promise<void> => {
  const parsed = GenerateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { concept, storyBible, modifier, existingCharacterJson } = parsed.data;

  let existingChar: unknown = null;
  if (existingCharacterJson) {
    try {
      existingChar = JSON.parse(existingCharacterJson);
    } catch {
      res.status(400).json({ error: "existingCharacterJson must be valid JSON" });
      return;
    }
  }

  const modifierInstructions: Record<string, string> = {
    darken: "Make this character darker, more morally compromised, and psychologically damaged.",
    tragic: "Amplify the tragedy. Every aspect should feel irredeemably doomed.",
    add_secret: "Add or deepen a devastating secret that recontextualizes everything.",
    regenerate: "Generate a completely fresh character that fits the story.",
  };

  const modifierHint = modifier && modifierInstructions[modifier]
    ? `MODIFICATION: ${modifierInstructions[modifier]}`
    : "";

  const existingHint = existingChar
    ? `Existing character to modify: ${JSON.stringify(existingChar)}`
    : "";

  const userPrompt = `Create a deeply realized protagonist character for this horror story.

Story: ${concept.title} (${concept.genre})
Premise: ${storyBible.premise}
Horror Rule: ${storyBible.horrorRule}
Central Fear: ${storyBible.centralFear}
${existingHint}
${modifierHint}

Return JSON with every field:
{
  "name": "...",
  "age": "...",
  "occupation": "...",
  "personality": "...",
  "externalGoal": "...",
  "internalNeed": "...",
  "fear": "specific fear beyond the horror",
  "emotionalWound": "past trauma that shapes them",
  "flaw": "...",
  "secret": "...",
  "lieBelieved": "the false belief they hold",
  "relationshipToHorror": "how they are personally connected to the horror",
  "transformation": "what they become by the end",
  "portraitPrompt": "a detailed image generation prompt for a cinematic portrait"
}`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateCharacterResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for character");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate character");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/character-arc
router.post("/generate/character-arc", async (req, res): Promise<void> => {
  const parsed = GenerateCharacterArcBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { character, concept, storyBible } = parsed.data;

  const userPrompt = `Create a macro character arc for this horror protagonist.

Character: ${character.name} — ${character.occupation}
Flaw: ${character.flaw}
Fear: ${character.fear}
Story: ${concept.title} (${concept.genre})
Horror Rule: ${storyBible.horrorRule}
Transformation: ${character.transformation}

Generate exactly 5 arc stages. Each stage should flow naturally from the previous.

Return JSON:
{
  "arcLabel": "Stage1 → Stage2 → Stage3 → Stage4 → Stage5",
  "stages": [
    {
      "label": "stage name (1-2 words)",
      "emotionalState": "...",
      "belief": "what they believe in this stage",
      "behavior": "how they act",
      "conflict": "what opposes them",
      "horrorConsequence": "how the horror punishes or challenges this stage"
    }
  ]
}`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateCharacterArcResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for character-arc");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate character arc");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/sequences
router.post("/generate/sequences", async (req, res): Promise<void> => {
  const parsed = GenerateSequencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { concept, storyBible, character, characterArc } = parsed.data;

  const userPrompt = `Break this horror story into exactly 5 major sequences. Each sequence should feel like an act in a horror film.

Story: ${concept.title} (${concept.genre})
Premise: ${storyBible.premise}
Horror Rule: ${storyBible.horrorRule}
Mystery: ${storyBible.mystery}
Reveal: ${storyBible.reveal}
Character: ${character.name} — Arc: ${characterArc.arcLabel}

For each sequence, also generate a 5-beat micro arc.

Return JSON:
{
  "sequences": [
    {
      "id": "seq-1",
      "number": 1,
      "title": "...",
      "description": "2-3 sentences",
      "horrorBeat": "the horror event in this sequence",
      "microArc": [
        { "label": "beat name", "description": "..." }
      ]
    }
  ]
}`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateSequencesResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for sequences");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate sequences");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/shots
router.post("/generate/shots", async (req, res): Promise<void> => {
  const parsed = GenerateShotsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sequence, concept, character, storyBible } = parsed.data;

  const userPrompt = `Generate 4-6 cinematic shots for this story sequence. Think like a horror film director.

Story: ${concept.title} (${concept.genre})
Visual Tone: ${concept.visualTone}
Sequence: ${sequence.title} — ${sequence.description}
Horror Beat: ${sequence.horrorBeat}
Character: ${character.name} — ${character.occupation}

Return JSON:
{
  "shots": [
    {
      "id": "shot-seq1-01",
      "shotNumber": "01A",
      "title": "short evocative title",
      "shotType": "e.g. Wide Shot / Close-Up / Extreme Close-Up",
      "cameraAngle": "e.g. Low Angle / Eye Level / Dutch Tilt",
      "framing": "description of composition",
      "lens": "e.g. 24mm / 50mm / 85mm",
      "subject": "what the shot focuses on",
      "characterAction": "what the character does",
      "environment": "...",
      "lighting": "e.g. practical lamp, single source",
      "mood": "...",
      "storyPurpose": "why this shot is here",
      "horrorBeat": "the horror element",
      "soundCue": "ambient or specific sound",
      "duration": "e.g. 3 seconds / 8 seconds",
      "imagePrompt": "detailed image generation prompt for this shot"
    }
  ]
}`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateShotsResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for shots");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate shots");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/endings
router.post("/generate/endings", async (req, res): Promise<void> => {
  const parsed = GenerateEndingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { concept, storyBible, character, characterArc } = parsed.data;

  const userPrompt = `Generate 8 alternate endings for this horror story — one for each ending type.

Story: ${concept.title} (${concept.genre})
Premise: ${storyBible.premise}
Horror Rule: ${storyBible.horrorRule}
Reveal: ${storyBible.reveal}
Character: ${character.name} — Transformation: ${character.transformation}
Arc: ${characterArc.arcLabel}

Ending types: Survivor, Tragic, Twist, Ambiguous, Cyclical, Cosmic, Transformation, "The Monster Wins"

Return JSON:
{
  "endings": [
    {
      "id": "ending-survivor",
      "type": "Survivor",
      "endingEvent": "what happens",
      "protagonistFate": "...",
      "thematicMeaning": "what it means",
      "finalImage": "description of final visual",
      "finalMoment": "the last line or action",
      "imagePrompt": "detailed image generation prompt for the final frame"
    }
  ]
}`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    const validated = GenerateEndingsResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for endings");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate endings");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/director-action
router.post("/generate/director-action", async (req, res): Promise<void> => {
  const parsed = ApplyDirectorActionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { action, target, currentContentJson, contextJson } = parsed.data;

  let currentContent: unknown;
  try {
    currentContent = JSON.parse(currentContentJson);
  } catch {
    res.status(400).json({ error: "currentContentJson must be valid JSON" });
    return;
  }

  let context: unknown = null;
  if (contextJson) {
    try {
      context = JSON.parse(contextJson);
    } catch {
      res.status(400).json({ error: "contextJson must be valid JSON" });
      return;
    }
  }

  const targetDescriptions: Record<string, string> = {
    story_bible: "Story Bible (premise, theme, centralFear, horrorRule, stakes, mystery, reveal, logline)",
    character: "Character (personality, fear, emotionalWound, flaw, secret, lieBelieved, relationshipToHorror, transformation)",
    sequence: "Sequence (title, description, horrorBeat, microArc)",
    shot: "Shot (characterAction, environment, mood, horrorBeat, soundCue, imagePrompt)",
  };

  const userPrompt = `Apply the director's instruction to this horror story element.

Director Action: "${action}"
Target: ${target} — ${targetDescriptions[target] ?? target}

Current content:
${JSON.stringify(currentContent, null, 2)}

${context ? `Story context:\n${JSON.stringify(context, null, 2)}` : ""}

Apply the director action by modifying the relevant fields. Keep all other fields unchanged. Return the complete modified object with the same structure.

Also write a brief "Director's Note" (1-2 sentences) explaining what changed and why.

Return JSON:
{
  "modifiedJson": "<the complete modified content object serialized as a JSON string>",
  "note": "Director's Note explaining the change"
}`;

  try {
    const raw = await generateJSON(SYSTEM_PROMPT, userPrompt);
    // Ensure modifiedJson is a string — the model may return it as a nested object
    if (raw && typeof raw === "object" && "modifiedJson" in raw && typeof (raw as Record<string, unknown>).modifiedJson !== "string") {
      (raw as Record<string, unknown>).modifiedJson = JSON.stringify((raw as Record<string, unknown>).modifiedJson);
    }
    const validated = ApplyDirectorActionResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Model output failed schema validation for director-action");
      res.status(502).json({ error: "Generation produced unexpected output. Please try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to apply director action");
    res.status(500).json({ error: "Generation failed" });
  }
});

// POST /generate/image
router.post("/generate/image", async (req, res): Promise<void> => {
  const parsed = GenerateImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, type } = parsed.data;

  // Enhance the prompt with cinematic horror style guidance
  const stylePrefix =
    type === "character_portrait"
      ? "Cinematic portrait photography, dramatic lighting, horror atmosphere, film grain, desaturated with deep shadows, highly detailed, photorealistic, 85mm lens bokeh background. "
      : type === "ending_frame"
      ? "Cinematic final frame, horror film still, wide shot, atmospheric, ominous, film grain, desaturated, dramatic composition. "
      : "Cinematic horror film still, dramatic lighting, film grain, desaturated with rich shadows, atmospheric, highly detailed, photorealistic. ";

  const enhancedPrompt = stylePrefix + prompt;

  try {
    // generateImageBuffer only supports 1024x1024 — this is the sole valid size
    const buffer = await generateImageBuffer(enhancedPrompt, "1024x1024");
    const raw = { b64_json: buffer.toString("base64"), prompt: enhancedPrompt };
    const validated = GenerateImageResponse.safeParse(raw);
    if (!validated.success) {
      req.log.warn({ err: validated.error.message }, "Image response failed schema validation");
      res.status(502).json({ error: "Image generation produced unexpected output." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate image");
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default router;
