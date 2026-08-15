import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGenerateShots, useGenerateImage, type Shot } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, CinematicButton, Badge } from '@/components/ui-custom';
import { ImageIcon, X, Loader2, Camera, MapPin, Eye, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Shots() {
  const { state, dispatch } = useProject();
  const [location] = useLocation();
  const generateShotsHook = useGenerateShots();
  const generateImageHook = useGenerateImage();
  
  // Parse query params manually since wouter doesn't have useSearchParams natively exposed in the same way
  const searchParams = new URLSearchParams(window.location.search);
  const seqIdParam = searchParams.get('seq');
  
  const { concept, character, storyBible, sequences, shots, storyboardFrames } = state.project;
  
  // Default to first sequence if none provided
  const activeSequenceId = seqIdParam || sequences[0]?.id;
  const activeSequence = sequences.find(s => s.id === activeSequenceId);
  const sequenceShots = activeSequenceId ? shots[activeSequenceId] || [] : [];
  
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);

  useEffect(() => {
    if (activeSequence && sequenceShots.length === 0 && !generateShotsHook.isPending) {
      generateShotsHook.mutate({
        data: {
          sequence: activeSequence,
          concept: concept!,
          character: character!,
          storyBible: storyBible!
        }
      }, {
        onSuccess: (data) => {
          dispatch({ 
            type: 'SET_SHOTS', 
            payload: { sequenceId: activeSequence.id, shots: data.shots } 
          });
        }
      });
    }
  }, [activeSequence, sequenceShots.length]);

  const handleGenerateFrame = (shot: Shot, e: React.MouseEvent) => {
    e.stopPropagation();
    generateImageHook.mutate({
      data: {
        prompt: shot.imagePrompt,
        type: 'scene_frame',
        size: '1024x1024'
      }
    }, {
      onSuccess: (res) => {
        dispatch({
          type: 'SET_STORYBOARD_FRAME',
          payload: { shotId: shot.id, url: `data:image/png;base64,${res.b64_json}` }
        });
      }
    });
  };

  if (!activeSequence) {
    return <div className="p-12 text-center text-muted-foreground">No sequence found. Go back to Sequences.</div>;
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Sequence Header Sticky */}
      <div className="p-6 border-b border-border/50 bg-background/90 backdrop-blur z-20 flex justify-between items-center shrink-0">
        <div>
          <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-mono">
            Sequence {String(activeSequence.number).padStart(2, '0')}
          </span>
          <h2 className="font-serif text-2xl text-foreground mt-1">{activeSequence.title}</h2>
        </div>
        <div className="flex gap-2">
           {sequences.map(s => (
             <a key={s.id} href={`/studio/shots?seq=${s.id}`} 
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded text-xs font-mono transition-colors border",
                  s.id === activeSequenceId ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                )}>
               {s.number}
             </a>
           ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Timeline / Shot Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {generateShotsHook.isPending && sequenceShots.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-video bg-card/50 border border-border/50 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
              {sequenceShots.map((shot, idx) => {
                const frameUrl = storyboardFrames[shot.id];
                const isGenerating = generateImageHook.isPending && generateImageHook.variables?.data.prompt === shot.imagePrompt;
                
                return (
                  <Card 
                    key={shot.id} 
                    className={cn(
                      "flex flex-col group cursor-pointer transition-all duration-300",
                      selectedShot?.id === shot.id ? "ring-2 ring-primary border-transparent" : "hover:border-primary/50"
                    )}
                    onClick={() => setSelectedShot(shot)}
                  >
                    {/* Frame Image Area */}
                    <div className="aspect-video bg-black relative border-b border-border/50 overflow-hidden">
                      {frameUrl ? (
                        <img src={frameUrl} alt={shot.title} className="w-full h-full object-cover filter contrast-110 sepia-[0.1]" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                           {isGenerating ? (
                             <>
                               <div className="w-6 h-6 border-t-2 border-primary rounded-full animate-spin mb-2" />
                               <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Rendering</span>
                             </>
                           ) : (
                             <>
                               <ImageIcon className="w-6 h-6 text-muted-foreground/30 mb-2 group-hover:text-primary/50 transition-colors" />
                               <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground/50">Missing Frame</p>
                             </>
                           )}
                        </div>
                      )}
                      
                      {/* Shot Number Badge */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono border border-white/10 text-white">
                        {shot.shotNumber}
                      </div>

                      {/* Generate Button Overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
                        !frameUrl && !isGenerating ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                      )}>
                        <CinematicButton 
                          variant="primary" 
                          className="py-2 px-4 text-[10px]" 
                          onClick={(e) => handleGenerateFrame(shot, e)}
                        >
                          Generate Frame
                        </CinematicButton>
                      </div>
                    </div>
                    
                    {/* Shot Info Footer */}
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-serif text-sm truncate pr-2 text-foreground/90">{shot.title}</h4>
                        <span className="text-[9px] font-mono text-muted-foreground shrink-0">{shot.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge className="text-[8px] bg-secondary border-none">{shot.shotType}</Badge>
                        <Badge className="text-[8px] bg-secondary border-none">{shot.cameraAngle}</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Shot Inspector Sidebar */}
        <div className={cn(
          "w-80 border-l border-border bg-card/80 backdrop-blur h-full shrink-0 flex flex-col absolute right-0 top-0 transition-transform duration-300 z-30",
          selectedShot ? "translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]" : "translate-x-full"
        )}>
          {selectedShot && (
            <>
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/50">
                <span className="font-mono text-sm tracking-widest text-primary">{selectedShot.shotNumber}</span>
                <button onClick={() => setSelectedShot(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-sm">
                <div>
                  <h3 className="font-serif text-xl mb-1">{selectedShot.title}</h3>
                  <p className="text-muted-foreground text-xs italic">{selectedShot.storyPurpose}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Camera className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Camera</span>
                      <p className="font-medium">{selectedShot.shotType} • {selectedShot.cameraAngle}</p>
                      <p className="text-xs text-foreground/70 mt-1">Lens: {selectedShot.lens}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Subject & Action</span>
                      <p className="font-medium">{selectedShot.subject}</p>
                      <p className="text-xs text-foreground/70 mt-1">{selectedShot.characterAction}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Environment</span>
                      <p className="font-medium">{selectedShot.environment}</p>
                      <p className="text-xs text-foreground/70 mt-1">Lighting: {selectedShot.lighting}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Audio / Mood</span>
                      <p className="font-medium">{selectedShot.mood}</p>
                      <p className="text-xs text-foreground/70 mt-1 border-l border-primary/50 pl-2">{selectedShot.soundCue}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <span className="text-[10px] uppercase text-destructive tracking-widest block mb-2">Horror Beat</span>
                  <p className="text-sm font-serif italic text-foreground/90">{selectedShot.horrorBeat}</p>
                </div>
              </div>
              
              <div className="p-4 border-t border-border/50 bg-background/50">
                <CinematicButton 
                  className="w-full py-3 text-xs" 
                  onClick={(e) => handleGenerateFrame(selectedShot, e)}
                  disabled={generateImageHook.isPending}
                >
                  {storyboardFrames[selectedShot.id] ? 'Regenerate Frame' : 'Generate Frame'}
                </CinematicButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
