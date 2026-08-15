import { useEffect } from 'react';
import { useGenerateCharacterArc } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, SectionHeader, CinematicButton } from '@/components/ui-custom';
import { ArrowRight, RefreshCcw } from 'lucide-react';

export default function CharacterArc() {
  const { state, dispatch } = useProject();
  const generateArc = useGenerateCharacterArc();

  const { concept, storyBible, character, characterArc } = state.project;

  useEffect(() => {
    if (concept && storyBible && character && !characterArc && !generateArc.isPending) {
      generateArc.mutate({
        data: { concept, storyBible, character }
      }, {
        onSuccess: (data) => {
          dispatch({ type: 'UPDATE_PROJECT', payload: { characterArc: data } });
        }
      });
    }
  }, [concept, storyBible, character, characterArc]);

  const handleRegenerate = () => {
    if (!concept || !storyBible || !character) return;
    generateArc.mutate({
      data: { concept, storyBible, character }
    }, {
      onSuccess: (data) => {
        dispatch({ type: 'UPDATE_PROJECT', payload: { characterArc: data } });
      }
    });
  };

  if (!character) {
    return <div className="p-12 text-center text-muted-foreground">Generate a Character first.</div>;
  }

  if (generateArc.isPending && !characterArc) {
    return (
      <div className="p-12 max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-border/50 rounded" />
        <div className="flex gap-4 overflow-x-auto pb-8">
          {[1,2,3,4,5].map(i => <div key={i} className="min-w-[300px] h-96 bg-card/50 rounded border border-border/50 shrink-0" />)}
        </div>
      </div>
    );
  }

  if (!characterArc) return null;

  return (
    <div className="py-12 px-8 max-w-[1400px] mx-auto animate-fade-in-slow">
      <div className="flex justify-between items-end mb-12">
        <SectionHeader 
          title="Descent Arc" 
          subtitle={characterArc.arcLabel}
          className="mb-0"
        />
        <CinematicButton variant="outline" onClick={handleRegenerate} disabled={generateArc.isPending}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate Arc
        </CinematicButton>
      </div>

      <div className="relative">
        {/* Connecting line behind cards */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-primary/20 -translate-y-1/2 hidden lg:block z-0" />
        
        <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-8 snap-x relative z-10">
          {characterArc.stages.map((stage, idx) => (
            <Card key={idx} className="min-w-[320px] max-w-[350px] shrink-0 snap-center flex flex-col relative border-t-4 border-t-primary/30">
              <div className="p-4 border-b border-border/50 bg-black/20 flex justify-between items-center">
                <span className="font-mono text-xl text-border">0{idx + 1}</span>
                <span className="font-serif text-lg text-primary">{stage.label}</span>
              </div>
              
              <div className="p-6 space-y-5 flex-1">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">State of Mind</span>
                  <p className="text-sm font-medium">{stage.emotionalState}</p>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Belief</span>
                  <p className="text-sm italic border-l-2 border-border pl-3 text-foreground/80">"{stage.belief}"</p>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Behavior</span>
                  <p className="text-sm text-foreground/90">{stage.behavior}</p>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Conflict</span>
                  <p className="text-sm text-foreground/90">{stage.conflict}</p>
                </div>
                
                <div className="pt-4 border-t border-border/50 mt-auto">
                  <span className="text-[10px] uppercase text-primary tracking-widest block mb-1 flex items-center gap-2">
                    Horror Consequence <ArrowRight className="w-3 h-3" />
                  </span>
                  <p className="text-sm text-primary/80">{stage.horrorConsequence}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
