import { useEffect, useState } from 'react';
import { useGenerateSequences, type Sequence } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, SectionHeader, CinematicButton, Badge } from '@/components/ui-custom';
import { Clapperboard, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

export default function Sequences() {
  const { state, dispatch } = useProject();
  const generateSeq = useGenerateSequences();
  const [expandedSeq, setExpandedSeq] = useState<string | null>(null);

  const { concept, storyBible, character, characterArc, sequences } = state.project;

  useEffect(() => {
    if (concept && storyBible && character && characterArc && sequences.length === 0 && !generateSeq.isPending) {
      generateSeq.mutate({
        data: { concept, storyBible, character, characterArc }
      }, {
        onSuccess: (data) => {
          dispatch({ type: 'UPDATE_PROJECT', payload: { sequences: data.sequences } });
          if (data.sequences.length > 0) {
            setExpandedSeq(data.sequences[0].id);
          }
        }
      });
    }
  }, [concept, storyBible, character, characterArc, sequences.length]);

  if (!characterArc) {
    return <div className="p-12 text-center text-muted-foreground">Generate a Character Arc first.</div>;
  }

  if (generateSeq.isPending && sequences.length === 0) {
    return (
      <div className="p-12 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-border/50 rounded mb-8" />
        {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-card/50 rounded border border-border/50" />)}
      </div>
    );
  }

  return (
    <div className="py-12 px-8 max-w-4xl mx-auto animate-fade-in-slow">
      <SectionHeader 
        title="Sequences" 
        subtitle="The major structural beats of the film."
      />

      <div className="space-y-4 mt-8">
        {sequences.map((seq) => {
          const isExpanded = expandedSeq === seq.id;
          return (
            <Card key={seq.id} className="transition-all duration-300 border-l-4 border-l-border hover:border-l-primary">
              <div 
                className="p-6 cursor-pointer flex items-start gap-4"
                onClick={() => setExpandedSeq(isExpanded ? null : seq.id)}
              >
                <div className="font-serif text-3xl text-border group-hover:text-primary transition-colors mt-1 w-12">
                  {String(seq.number).padStart(2, '0')}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-serif text-xl text-foreground">{seq.title}</h3>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{seq.description}</p>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-black/20 animate-fade-in-slow ml-16">
                  <div className="mb-6">
                    <span className="text-[10px] uppercase text-primary tracking-widest block mb-2">Horror Beat</span>
                    <p className="text-sm font-medium text-foreground italic border-l-2 border-primary pl-3">
                      {seq.horrorBeat}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-[10px] uppercase text-muted-foreground tracking-widest block mb-4">Micro Arc Progression</span>
                    <div className="flex gap-2 justify-between">
                      {seq.microArc.map((beat, i) => (
                        <div key={i} className="flex-1 text-center group/beat">
                          <div className="w-full h-1 bg-border group-hover/beat:bg-primary transition-colors mb-2 rounded-full relative">
                            {i < seq.microArc.length - 1 && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-full h-[1px] bg-border z-0 hidden" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono block text-muted-foreground group-hover/beat:text-foreground transition-colors uppercase truncate px-1">
                            {beat.label}
                          </span>
                          <div className="opacity-0 group-hover/beat:opacity-100 absolute bg-popover border border-border p-2 text-xs rounded shadow-xl pointer-events-none mt-2 z-50 w-48 text-left transition-opacity">
                            {beat.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/20">
                    <Link href={`/studio/shots?seq=${seq.id}`}>
                      <CinematicButton variant="outline" className="text-xs py-2">
                        <Clapperboard className="w-3 h-3 mr-2" /> Enter Shot List
                      </CinematicButton>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
