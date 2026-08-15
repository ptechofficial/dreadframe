import { useEffect } from 'react';
import { useGenerateCharacter, useGenerateImage } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, SectionHeader, CinematicButton } from '@/components/ui-custom';
import { User, Skull, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function Characters() {
  const { state, dispatch } = useProject();
  const generateChar = useGenerateCharacter();
  const generateImg = useGenerateImage();

  const { concept, storyBible, character, characterPortraitUrl } = state.project;

  useEffect(() => {
    if (concept && storyBible && !character && !generateChar.isPending && !generateChar.data) {
      generateChar.mutate({
        data: { concept, storyBible }
      }, {
        onSuccess: (data) => {
          dispatch({ type: 'UPDATE_PROJECT', payload: { character: data } });
        }
      });
    }
  }, [concept, storyBible, character]);

  const handleGeneratePortrait = () => {
    if (!character?.portraitPrompt) return;
    generateImg.mutate({
      data: {
        prompt: character.portraitPrompt,
        type: 'character_portrait'
      }
    }, {
      onSuccess: (res) => {
        dispatch({ 
          type: 'UPDATE_PROJECT', 
          payload: { characterPortraitUrl: `data:image/png;base64,${res.b64_json}` } 
        });
      }
    });
  };

  const handleModifier = (modifier: string) => {
    if (!concept || !storyBible || !character) return;
    generateChar.mutate({
      data: {
        concept,
        storyBible,
        modifier,
        existingCharacterJson: JSON.stringify(character)
      }
    }, {
      onSuccess: (data) => {
        dispatch({ type: 'UPDATE_PROJECT', payload: { character: data } });
      }
    });
  };

  if (!storyBible) {
    return <div className="p-12 text-center text-muted-foreground">Generate a Story Bible first.</div>;
  }

  if (generateChar.isPending && !character) {
    return (
      <div className="p-12 max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-border/50 rounded" />
        <div className="flex flex-col md:flex-row gap-8">
           <div className="w-64 h-80 bg-card/50 border border-border/50 shrink-0" />
           <div className="flex-1 grid grid-cols-2 gap-4">
             {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 bg-card/50 rounded" />)}
           </div>
        </div>
      </div>
    );
  }

  if (!character) return null;

  const fields = [
    { key: 'personality', label: 'Personality', val: character.personality },
    { key: 'externalGoal', label: 'External Goal', val: character.externalGoal },
    { key: 'internalNeed', label: 'Internal Need', val: character.internalNeed },
    { key: 'fear', label: 'Deepest Fear', val: character.fear },
    { key: 'emotionalWound', label: 'Emotional Wound', val: character.emotionalWound },
    { key: 'flaw', label: 'Fatal Flaw', val: character.flaw },
    { key: 'secret', label: 'Dark Secret', val: character.secret },
    { key: 'lieBelieved', label: 'The Lie They Believe', val: character.lieBelieved },
    { key: 'relationshipToHorror', label: 'Relationship to Horror', val: character.relationshipToHorror },
    { key: 'transformation', label: 'Transformation', val: character.transformation },
  ];

  return (
    <div className="py-12 px-8 max-w-6xl mx-auto animate-fade-in-slow">
      <div className="flex justify-between items-end mb-8">
        <SectionHeader 
          title="Protagonist" 
          subtitle="The victim of your narrative."
          className="mb-0"
        />
        <div className="flex gap-2">
          <CinematicButton variant="outline" onClick={() => handleModifier('darken')}>
            <Skull className="w-4 h-4 mr-2" /> Darken
          </CinematicButton>
          <CinematicButton variant="outline" onClick={() => handleModifier('tragic')}>
            Make Tragic
          </CinematicButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Portrait & Identity */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="aspect-[3/4] w-full border-2 border-border/80 bg-card relative overflow-hidden flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-noise opacity-30 z-0 pointer-events-none" />
            
            {characterPortraitUrl ? (
              <img src={characterPortraitUrl} alt={character.name} className="absolute inset-0 w-full h-full object-cover z-10 filter sepia-[0.2] contrast-125" />
            ) : generateImg.isPending ? (
              <div className="absolute inset-0 bg-background/80 z-20 flex items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest text-primary animate-pulse">Developing Film...</span>
              </div>
            ) : (
              <div className="relative z-10 text-center opacity-50 flex flex-col items-center gap-4">
                <User className="w-16 h-16 mb-2" />
                <p className="text-xs uppercase tracking-widest font-mono">No visual record</p>
              </div>
            )}
          </div>
          
          <CinematicButton 
            className="w-full py-3" 
            onClick={handleGeneratePortrait}
            disabled={generateImg.isPending}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {characterPortraitUrl ? 'Regenerate Portrait' : 'Generate Portrait'}
          </CinematicButton>

          <Card className="p-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground block mb-1">Name</label>
              <input 
                type="text" 
                defaultValue={character.name}
                className="w-full bg-transparent font-serif text-2xl text-foreground focus:outline-none focus:text-primary transition-colors"
                onChange={(e) => dispatch({ type: 'UPDATE_PROJECT', payload: { character: { ...character, name: e.target.value } }})}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase text-muted-foreground block mb-1">Age</label>
                <input 
                  type="text" 
                  defaultValue={character.age}
                  className="w-full bg-transparent text-sm focus:outline-none"
                  onChange={(e) => dispatch({ type: 'UPDATE_PROJECT', payload: { character: { ...character, age: e.target.value } }})}
                />
              </div>
              <div className="flex-2">
                <label className="text-[10px] uppercase text-muted-foreground block mb-1">Occupation</label>
                <input 
                  type="text" 
                  defaultValue={character.occupation}
                  className="w-full bg-transparent text-sm focus:outline-none"
                  onChange={(e) => dispatch({ type: 'UPDATE_PROJECT', payload: { character: { ...character, occupation: e.target.value } }})}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Traits Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <Card key={f.key} className="p-4 group">
              <label className="text-[10px] uppercase tracking-widest text-primary/80 font-mono block mb-2">
                {f.label}
              </label>
              <textarea 
                defaultValue={f.val}
                className="w-full bg-transparent text-sm text-foreground/90 leading-relaxed resize-none focus:outline-none min-h-[60px]"
                onChange={(e) => {
                  dispatch({ 
                    type: 'UPDATE_PROJECT', 
                    payload: { character: { ...character, [f.key]: e.target.value } } 
                  });
                }}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
