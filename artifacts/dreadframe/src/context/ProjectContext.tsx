import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { 
  HorrorConcept, 
  StoryBibleOutput, 
  CharacterOutput, 
  CharacterArcOutput, 
  Sequence, 
  Shot, 
  Ending 
} from '@workspace/api-client-react';

export interface DreadframeProject {
  id: string;
  title: string;
  concept: HorrorConcept | null;
  storyBible: StoryBibleOutput | null;
  character: CharacterOutput | null;
  characterPortraitUrl: string | null;
  characterArc: CharacterArcOutput | null;
  sequences: Sequence[];
  shots: Record<string, Shot[]>; // sequenceId -> shots
  storyboardFrames: Record<string, string>; // shotId -> base64 data URL
  endings: Ending[];
  visualStyle: string;
  userPrompt: string;
  mode: 'idea' | 'photo' | 'surprise' | null;
  userPhotoUrl: string | null;
  createdAt: string;
}

const DEMO_PROJECT: DreadframeProject = {
  id: 'demo-1',
  title: 'Someone Else Is Living My Life',
  concept: {
    id: 'concept-demo',
    title: 'Someone Else Is Living My Life',
    genre: 'Psychological/Doppelgänger Horror',
    premise: 'A successful architect discovers another version of herself is systematically taking over her life, and everyone prefers the replacement.',
    centralFear: 'The terror of being replaceable and the loss of identity.',
    visualTone: 'Cold, sterile modernism giving way to claustrophobic, shifting environments.',
    narrativeHook: 'She arrives at work to find someone else sitting at her desk, wearing her clothes, and no one seems to notice the difference.'
  },
  storyBible: {
    premise: 'A successful architect discovers another version of herself is systematically taking over her life, and everyone prefers the replacement.',
    theme: 'Identity is fragile; we are only the sum of our relationships and achievements.',
    centralFear: 'The terror of being replaceable and the loss of identity.',
    horrorRule: 'The Doppelgänger cannot be physically harmed by the protagonist, and attempting to do so only damages the protagonist\'s own body.',
    stakes: 'If she cannot prove her identity, she will fade entirely from existence.',
    mystery: 'Where did the Doppelgänger come from, and why is it better at being her than she is?',
    reveal: 'The Doppelgänger is not an invader, but the idealized version of herself she always tried to be, made flesh.',
    logline: 'When an ambitious architect is replaced by a flawless doppelgänger, she must dismantle her own perfectly constructed life to prove she is real before she fades from existence.'
  },
  character: {
    name: 'Eleanor Vance',
    age: '34',
    occupation: 'Senior Architect',
    personality: 'Obsessive, detail-oriented, emotionally guarded, highly competent but deeply insecure.',
    externalGoal: 'To reclaim her life and career from the Doppelgänger.',
    internalNeed: 'To accept her own flaws and stop striving for an impossible perfection.',
    fear: 'Being ordinary, forgotten, or exposed as a fraud.',
    emotionalWound: 'Her parents constantly compared her to a deceased older sister she could never live up to.',
    flaw: 'She values achievements and appearances over genuine human connection.',
    secret: 'She stole the design that made her career from a junior colleague who later quit in disgrace.',
    lieBelieved: 'If I am perfect, I will be unassailable and loved.',
    relationshipToHorror: 'The horror is a manifestation of her own impossible standards turned against her.',
    transformation: 'From a control freak who needs external validation to someone willing to destroy her own legacy to survive.',
    portraitPrompt: 'A striking portrait of a 34-year-old female architect with sharp features and tired eyes, wearing a severe, tailored modernist blazer. Her expression is tense and guarded. Cinematic lighting, cold urban environment, subtle uneasy atmosphere, photographic, 8k, highly detailed.'
  },
  characterPortraitUrl: null,
  characterArc: {
    stages: [
      {
        label: 'Control',
        emotionalState: 'Confident but exhausted',
        belief: 'I am in complete control of my life.',
        behavior: 'Micromanaging, dismissive of others.',
        conflict: 'Minor friction with colleagues who find her abrasive.',
        horrorConsequence: 'The Doppelgänger studies these interactions and learns how to be "better".'
      },
      {
        label: 'Suspicion',
        emotionalState: 'Paranoid and disoriented',
        belief: 'Someone is trying to sabotage me.',
        behavior: 'Checking records, interrogating friends, acting erratically.',
        conflict: 'Her friends and colleagues think she is having a breakdown.',
        horrorConsequence: 'The Doppelgänger smoothly steps in to "help" cover for her.'
      },
      {
        label: 'Obsession',
        emotionalState: 'Feverish desperation',
        belief: 'I must prove I am the real Eleanor.',
        behavior: 'Stalking the Doppelgänger, neglecting her actual life, gathering bizarre evidence.',
        conflict: 'She alienates everyone who might have helped her.',
        horrorConsequence: 'The Doppelgänger fully assumes her role, and Eleanor becomes the outsider.'
      },
      {
        label: 'Revelation',
        emotionalState: 'Shattered denial',
        belief: 'The Doppelgänger is what I always wanted to be.',
        behavior: 'Confronting the Doppelgänger directly, discovering the physical rule.',
        conflict: 'Realizing she cannot fight it conventionally.',
        horrorConsequence: 'Eleanor begins to physically fade or lose substance.'
      },
      {
        label: 'Surrender / Destruction',
        emotionalState: 'Cold resolve',
        belief: 'The only way to win is to destroy the life we share.',
        behavior: 'Sabotaging her own work, burning bridges, ruining her reputation.',
        conflict: 'The Doppelgänger tries to salvage the perfection Eleanor is destroying.',
        horrorConsequence: 'The Doppelgänger cannot survive in an imperfect life, but Eleanor is left with nothing.'
      }
    ],
    arcLabel: 'The Destruction of Perfection'
  },
  sequences: [
    {
      id: 'seq-1',
      number: 1,
      title: 'The Shift',
      description: 'Eleanor notices subtle changes in her apartment and office that she didn\'t make.',
      horrorBeat: 'The realization that someone else has been in her space.',
      microArc: [
        { label: 'Normalcy', description: 'Eleanor completes a meticulous morning routine.' },
        { label: 'Anomaly', description: 'A coffee cup is left in the wrong place.' },
        { label: 'Dismissal', description: 'She blames her own exhaustion.' },
        { label: 'Escalation', description: 'Work files are completed perfectly, but not by her.' },
        { label: 'Dread', description: 'She sees a reflection that doesn\'t quite match her movements.' }
      ]
    }
  ],
  shots: {},
  storyboardFrames: {},
  endings: [],
  visualStyle: 'cinematic',
  userPrompt: '',
  mode: 'idea',
  userPhotoUrl: null,
  createdAt: new Date().toISOString()
};

const INITIAL_STATE = {
  project: DEMO_PROJECT,
};

type Action =
  | { type: 'SET_PROJECT'; payload: DreadframeProject }
  | { type: 'UPDATE_PROJECT'; payload: Partial<DreadframeProject> }
  | { type: 'SET_SHOTS'; payload: { sequenceId: string; shots: Shot[] } }
  | { type: 'SET_STORYBOARD_FRAME'; payload: { shotId: string; url: string } };

function projectReducer(state: typeof INITIAL_STATE, action: Action): typeof INITIAL_STATE {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.payload };
    case 'UPDATE_PROJECT':
      return { ...state, project: { ...state.project, ...action.payload } };
    case 'SET_SHOTS':
      return {
        ...state,
        project: {
          ...state.project,
          shots: { ...state.project.shots, [action.payload.sequenceId]: action.payload.shots }
        }
      };
    case 'SET_STORYBOARD_FRAME':
      return {
        ...state,
        project: {
          ...state.project,
          storyboardFrames: { ...state.project.storyboardFrames, [action.payload.shotId]: action.payload.url }
        }
      };
    default:
      return state;
  }
}

const ProjectContext = createContext<{
  state: typeof INITIAL_STATE;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, INITIAL_STATE, (initial) => {
    const saved = localStorage.getItem('dreadframe_project');
    if (saved) {
      try {
        return { project: JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved project', e);
      }
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('dreadframe_project', JSON.stringify(state.project));
  }, [state.project]);

  // Ensure app is always dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
