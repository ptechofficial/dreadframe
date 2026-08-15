import { useState } from 'react';
import { useApplyDirectorAction } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { CinematicButton } from './ui-custom';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

const ACTIONS = [
  "Make this scarier",
  "Slow the pacing",
  "Add foreshadowing",
  "Make it psychological",
  "Add a disturbing reveal",
  "Create a false ending",
  "Make the protagonist unreliable",
  "Increase body horror",
  "Remove supernatural elements",
  "Turn this into folk horror",
];

export function DirectorPanel() {
  const { state, dispatch } = useProject();
  const applyAction = useApplyDirectorAction();
  const [location] = useLocation();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState('');

  // Determine target based on route
  const getTargetAndContent = (): { target: 'story_bible' | 'character' | 'sequence' | 'shot', content: string } | null => {
    if (location.includes('/story') && state.project.storyBible) {
      return { target: 'story_bible', content: JSON.stringify(state.project.storyBible) };
    }
    if (location.includes('/characters') && state.project.character) {
      return { target: 'character', content: JSON.stringify(state.project.character) };
    }
    // Sequences and shots are more complex, skipping direct edits for now unless specifically targeted
    return null;
  };

  const targetInfo = getTargetAndContent();

  const handleAction = (actionStr: string) => {
    if (!targetInfo) return;
    
    setActiveAction(actionStr);
    applyAction.mutate({
      data: {
        action: actionStr,
        target: targetInfo.target,
        currentContentJson: targetInfo.content,
        contextJson: JSON.stringify({ concept: state.project.concept })
      }
    }, {
      onSuccess: (res) => {
        try {
          const updatedContent = JSON.parse(res.modifiedJson);
          if (targetInfo.target === 'story_bible') {
            dispatch({ type: 'UPDATE_PROJECT', payload: { storyBible: updatedContent } });
          } else if (targetInfo.target === 'character') {
            dispatch({ type: 'UPDATE_PROJECT', payload: { character: updatedContent } });
          }
        } catch (e) {
          console.error("Failed to parse director output", e);
        }
      },
      onSettled: () => {
        setActiveAction(null);
      }
    });
  };

  return (
    <aside className="w-72 border-l border-border bg-card/50 h-full flex flex-col relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none" />
      
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-primary" />
        <h3 className="font-serif tracking-widest text-sm uppercase">Director AI</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!targetInfo ? (
          <div className="text-center text-muted-foreground text-xs p-4 border border-dashed border-border rounded">
            Navigate to Story or Characters to use Director actions.
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Direct the AI to modify the current {targetInfo.target.replace('_', ' ')}.
            </p>
            <div className="space-y-2">
              {ACTIONS.map(action => (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  disabled={applyAction.isPending}
                  className={cn(
                    "w-full text-left text-xs py-2 px-3 rounded-sm transition-all border",
                    activeAction === action 
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-background/50 border-border/50 text-foreground/70 hover:text-foreground hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{action}</span>
                    {activeAction === action && <Loader2 className="w-3 h-3 animate-spin" />}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border/50 mt-4">
               <textarea 
                 value={customAction}
                 onChange={(e) => setCustomAction(e.target.value)}
                 placeholder="Custom direction..."
                 className="w-full bg-background border border-border rounded-sm p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none h-20"
               />
               <CinematicButton 
                 className="w-full mt-2 py-2 text-[10px]" 
                 variant="outline"
                 onClick={() => {
                   if (customAction.trim()) {
                     handleAction(customAction.trim());
                     setCustomAction('');
                   }
                 }}
                 disabled={!customAction.trim() || applyAction.isPending}
                 isLoading={applyAction.isPending && activeAction === customAction}
               >
                 Apply Direction
               </CinematicButton>
            </div>
          </>
        )}
      </div>
      
      {applyAction.data?.note && (
        <div className="p-4 bg-primary/10 border-t border-primary/30">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Director's Note</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed italic">
            "{applyAction.data.note}"
          </p>
        </div>
      )}
    </aside>
  );
}
