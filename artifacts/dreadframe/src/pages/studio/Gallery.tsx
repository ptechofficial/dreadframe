import { useProject } from '@/context/ProjectContext';
import { SectionHeader } from '@/components/ui-custom';
import { Link } from 'wouter';

export default function Gallery() {
  const { state } = useProject();
  const { shots, storyboardFrames, sequences } = state.project;

  // Flatten all generated frames into a single array for display
  const allFrames = sequences.flatMap(seq => {
    const seqShots = shots[seq.id] || [];
    return seqShots.map(shot => {
      const url = storyboardFrames[shot.id];
      if (!url) return null;
      return {
        url,
        shot,
        seq
      };
    }).filter(Boolean);
  });

  return (
    <div className="py-12 px-8 max-w-[1600px] mx-auto animate-fade-in-slow h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <SectionHeader 
          title="Director's Wall" 
          subtitle="All realized frames from the nightmare."
          className="mb-0"
        />
        <div className="text-sm font-mono text-muted-foreground">
          {allFrames.length} Frames Generated
        </div>
      </div>

      {allFrames.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/50 bg-card/20">
          <p className="font-serif text-xl mb-2 text-foreground/80">The wall is empty.</p>
          <p className="text-sm text-muted-foreground mb-6">Generate frames in the Shots panel to build your storyboard.</p>
          <Link href="/studio/sequences" className="text-primary hover:text-white uppercase tracking-widest text-xs font-mono transition-colors">
            Go to Sequences →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-12 overflow-y-auto custom-scrollbar">
          {allFrames.map((frame, i) => (
            <div key={i} className="group relative aspect-video bg-black overflow-hidden border border-border/20 cursor-pointer">
              <img 
                src={frame?.url} 
                alt={frame?.shot.title} 
                className="w-full h-full object-cover filter contrast-110 sepia-[0.1] transition-transform duration-700 group-hover:scale-105" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <div className="text-[9px] font-mono text-primary mb-1">
                  SEQ {frame?.seq.number} / SHOT {frame?.shot.shotNumber}
                </div>
                <div className="font-serif text-xs text-white line-clamp-1">{frame?.shot.title}</div>
                <div className="text-[10px] text-white/70 line-clamp-2 mt-1 leading-tight">{frame?.shot.storyPurpose}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
