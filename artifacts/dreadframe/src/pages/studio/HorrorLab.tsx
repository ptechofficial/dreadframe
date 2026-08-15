import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGenerateHorrorConcepts, type HorrorConcept } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, SectionHeader, CinematicButton, Badge } from '@/components/ui-custom';
import { Shuffle } from 'lucide-react';

export default function HorrorLab() {
  const { state, dispatch } = useProject();
  const [, setLocation] = useLocation();
  const generateConcepts = useGenerateHorrorConcepts();

  useEffect(() => {
    // Generate concepts on mount if we don't have them
    if (!state.project.concept && !generateConcepts.data && !generateConcepts.isPending) {
      generateConcepts.mutate({
        data: {
          prompt: state.project.userPrompt || 'A terrifying nightmare',
          mode: state.project.mode || 'idea'
        }
      });
    }
  }, []);

  const handleSelectConcept = (concept: HorrorConcept) => {
    dispatch({ 
      type: 'UPDATE_PROJECT', 
      payload: { 
        concept,
        title: concept.title
      } 
    });
    setLocation('/studio/story');
  };

  const handleMakeStranger = () => {
    generateConcepts.mutate({
      data: {
        prompt: state.project.userPrompt + ' Make it much stranger, surreal, and deeply disturbing.',
        mode: state.project.mode || 'idea'
      }
    });
  };

  return (
    <div className="py-12 px-8 max-w-6xl mx-auto animate-fade-in-slow">
      <div className="flex justify-between items-end mb-8">
        <SectionHeader 
          title="Horror Lab" 
          subtitle="Select a concept to form the basis of your nightmare."
          className="mb-0"
        />
        <div className="flex gap-4">
          <CinematicButton 
            variant="outline" 
            onClick={() => generateConcepts.mutate({
              data: { prompt: state.project.userPrompt, mode: state.project.mode || 'idea' }
            })}
            disabled={generateConcepts.isPending}
          >
            Regenerate All
          </CinematicButton>
          <CinematicButton 
            variant="ghost" 
            className="text-primary hover:text-primary-foreground hover:bg-primary/20"
            onClick={handleMakeStranger}
            disabled={generateConcepts.isPending}
          >
            <Shuffle className="w-4 h-4 mr-2" /> Make Stranger
          </CinematicButton>
        </div>
      </div>

      {generateConcepts.isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-card/50 border border-border/50 animate-pulse rounded flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 cinematic-gradient opacity-20" />
              <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin opacity-50" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(generateConcepts.data?.concepts || [state.project.concept]).filter(Boolean).map((concept, i) => concept && (
            <Card key={concept.id || i} className="p-6 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <Badge className="border-primary/30 text-primary bg-primary/5">{concept.genre}</Badge>
              </div>
              <h3 className="font-serif text-2xl mb-4 group-hover:text-primary transition-colors">{concept.title}</h3>
              
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Premise</span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{concept.premise}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-primary/70 block mb-1">Central Fear</span>
                  <p className="text-sm text-foreground/90 italic">{concept.centralFear}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Hook</span>
                  <p className="text-sm text-foreground/80">{concept.narrativeHook}</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border/50 flex justify-between items-center">
                <CinematicButton className="w-full" onClick={() => handleSelectConcept(concept)}>
                  Commit to this Dread
                </CinematicButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
