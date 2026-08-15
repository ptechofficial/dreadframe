import { useProject } from '@/context/ProjectContext';
import { SectionHeader, Card, CinematicButton, Badge } from '@/components/ui-custom';
import { Link } from 'wouter';
import { BookOpen, Users, Film, ImageIcon, ArrowRight } from 'lucide-react';

export default function Overview() {
  const { state } = useProject();
  const { title, concept, storyBible, character, sequences, shots, storyboardFrames } = state.project;

  const framesCount = Object.keys(storyboardFrames).length;
  
  // Calculate total shots across all sequences
  const totalShots = Object.values(shots).reduce((acc, seqShots) => acc + seqShots.length, 0);
  const progress = totalShots > 0 ? Math.round((framesCount / totalShots) * 100) : 0;

  return (
    <div className="py-12 px-8 max-w-5xl mx-auto animate-fade-in-slow">
      <div className="flex justify-between items-start mb-12">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{concept?.genre || 'Untitled Nightmare'}</Badge>
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight">
            {title || 'Untitled Project'}
          </h1>
          {storyBible && (
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl italic font-serif">
              "{storyBible.logline}"
            </p>
          )}
        </div>
        <Link href="/studio/new">
          <CinematicButton variant="outline" className="text-xs">
            Start New Project
          </CinematicButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Core Pillars */}
        <div className="space-y-6 md:col-span-2">
          {storyBible && (
            <Card className="p-6 border-l-4 border-l-primary/50">
              <h3 className="text-xs uppercase tracking-widest text-primary font-mono mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Foundation
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Theme</span>
                  <p className="text-sm">{storyBible.theme}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">Central Fear</span>
                  <p className="text-sm italic">{storyBible.centralFear}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1">The Rule</span>
                  <p className="text-sm font-medium text-destructive/90">{storyBible.horrorRule}</p>
                </div>
              </div>
            </Card>
          )}

          {character && (
            <Card className="p-6">
              <h3 className="text-xs uppercase tracking-widest text-foreground font-mono mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Protagonist
              </h3>
              <div className="flex items-start gap-6">
                {state.project.characterPortraitUrl ? (
                   <img src={state.project.characterPortraitUrl} className="w-20 h-24 object-cover filter contrast-125 sepia-[0.2] border border-border" />
                ) : (
                  <div className="w-20 h-24 bg-card/50 border border-border flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
                <div>
                  <h4 className="font-serif text-xl text-white">{character.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{character.age} • {character.occupation}</p>
                  <p className="text-sm text-foreground/80 line-clamp-2">{character.personality}</p>
                  <Link href="/studio/characters" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary hover:text-white mt-3 transition-colors">
                    View Profile <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Status / Progress */}
        <div className="space-y-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-xs uppercase tracking-widest text-primary font-mono mb-4">Production Status</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Sequences</span>
                  <span className="font-mono">{sequences.length}/5</span>
                </div>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50" style={{ width: `${(sequences.length / 5) * 100}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Storyboard</span>
                  <span className="font-mono">{framesCount}/{totalShots || '?'} Frames</span>
                </div>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <Link href={sequences.length > 0 ? "/studio/gallery" : "/studio/sequences"}>
                <CinematicButton className="w-full text-[10px] py-2">
                  <ImageIcon className="w-3 h-3 mr-2" /> 
                  {sequences.length > 0 ? "View Gallery" : "Build Sequences"}
                </CinematicButton>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
