import { useEffect } from 'react';
import { useGenerateEndings, useGenerateImage } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, SectionHeader, CinematicButton, Badge } from '@/components/ui-custom';
import { ImageIcon } from 'lucide-react';

export default function Endings() {
  const { state, dispatch } = useProject();
  const generateEndingsHook = useGenerateEndings();
  const generateImg = useGenerateImage();

  const { concept, storyBible, character, characterArc, endings } = state.project;

  useEffect(() => {
    if (concept && storyBible && character && characterArc && (!endings || endings.length === 0) && !generateEndingsHook.isPending) {
      generateEndingsHook.mutate({
        data: { concept, storyBible, character, characterArc }
      }, {
        onSuccess: (data) => {
          dispatch({ type: 'UPDATE_PROJECT', payload: { endings: data.endings } });
        }
      });
    }
  }, [concept, storyBible, character, characterArc, endings]);

  // Use the same storyboard frame dictionary but prefixed to avoid collisions, or just store ending images on the ending object.
  // For simplicity, we'll store generated ending images in storyboardFrames using ending.id
  
  const handleGenerateFrame = (ending: any) => {
    generateImg.mutate({
      data: {
        prompt: ending.imagePrompt,
        type: 'ending_frame',
        size: '1024x1024'
      }
    }, {
      onSuccess: (res) => {
        dispatch({
          type: 'SET_STORYBOARD_FRAME',
          payload: { shotId: `ending-${ending.id}`, url: `data:image/png;base64,${res.b64_json}` }
        });
      }
    });
  };

  if (!characterArc) {
    return <div className="p-12 text-center text-muted-foreground">Generate a Character Arc first.</div>;
  }

  if (generateEndingsHook.isPending && (!endings || endings.length === 0)) {
    return (
      <div className="p-12 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-border/50 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-card/50 rounded border border-border/50" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-8 max-w-[1400px] mx-auto animate-fade-in-slow">
      <SectionHeader 
        title="Alternate Fates" 
        subtitle="How does the nightmare conclude?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        {endings.map(ending => {
          const frameUrl = state.project.storyboardFrames[`ending-${ending.id}`];
          const isGenerating = generateImg.isPending && generateImg.variables?.data.prompt === ending.imagePrompt;

          return (
            <Card key={ending.id} className="flex flex-col h-full">
              <div className="aspect-video bg-black relative border-b border-border/50 overflow-hidden">
                {frameUrl ? (
                  <img src={frameUrl} alt={ending.type} className="w-full h-full object-cover filter contrast-125 sepia-[0.2]" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    {isGenerating ? (
                      <div className="w-6 h-6 border-t-2 border-primary rounded-full animate-spin mb-2" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    )}
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/80 text-white border-white/20 backdrop-blur">{ending.type}</Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Final Event</span>
                  <p className="text-sm font-medium leading-relaxed">{ending.endingEvent}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Protagonist Fate</span>
                  <p className="text-sm text-foreground/80">{ending.protagonistFate}</p>
                </div>
                <div className="pb-4 mb-4 border-b border-border/50">
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Final Image</span>
                  <p className="text-xs italic text-primary/80">"{ending.finalImage}"</p>
                </div>
                
                <div className="mt-auto pt-2">
                  <CinematicButton 
                    variant="outline" 
                    className="w-full py-2 text-[10px]"
                    onClick={() => handleGenerateFrame(ending)}
                    disabled={generateImg.isPending}
                  >
                    {frameUrl ? 'Regenerate Frame' : 'Visualize Ending'}
                  </CinematicButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
