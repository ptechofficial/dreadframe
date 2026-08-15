import { Link } from 'wouter';
import { CinematicButton } from '@/components/ui-custom';
import { Eye, Skull, Sparkles, MoveRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="film-grain" />
      
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="font-serif text-2xl tracking-[0.3em] text-foreground font-bold">DREADFRAME</div>
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase font-mono">
          <a href="#how" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
          <a href="#themes" className="text-muted-foreground hover:text-primary transition-colors">Themes</a>
          <Link href="/studio" className="text-muted-foreground hover:text-primary transition-colors">Studio</Link>
          <Link href="/studio">
            <CinematicButton variant="outline" className="py-2 px-4 text-xs">Enter Studio</CinematicButton>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 cinematic-gradient opacity-60 z-0" />
          
          {/* Abstract background shapes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full z-0 pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-slide-up-slow">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 inline-flex">AI-Powered Horror Studio</Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight">
              Put yourself inside <br/><span className="text-primary/90 italic">the nightmare.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Co-direct an algorithmic horror story where you are the protagonist. Generate concepts, build a cinematic storyboard, and watch your personal dread unfold.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/studio/new">
                <CinematicButton className="px-8 py-4 text-sm w-full sm:w-auto">
                  Create a Nightmare
                </CinematicButton>
              </Link>
              <Link href="/studio">
                <CinematicButton variant="ghost" className="px-8 py-4 text-sm w-full sm:w-auto border-border/50">
                  See Example
                </CinematicButton>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="py-24 px-6 md:px-12 lg:px-24 bg-card/30 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-serif tracking-widest uppercase mb-4">The Process</h2>
              <div className="w-12 h-px bg-primary/50 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { num: "01", title: "Become the Protagonist", desc: "Upload your photo or describe yourself to cast yourself in the leading role." },
                { num: "02", title: "Build the Nightmare", desc: "Let the AI generate a bespoke Horror Concept, Story Bible, and Character Arc." },
                { num: "03", title: "Direct the Story", desc: "Tweak pacing, increase body horror, or force a tragic ending using the Director AI." },
                { num: "04", title: "See the Horror", desc: "Generate a fully visualized, shot-by-shot cinematic storyboard of your demise." }
              ].map((step, i) => (
                <div key={i} className="relative p-6 border border-border/50 bg-background/50 group hover:border-primary/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 font-serif text-4xl text-border group-hover:text-primary/20 transition-colors">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-serif mb-3 relative z-10">{step.title}</h3>
                  <p className="text-sm text-muted-foreground relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Themes Grid */}
        <section id="themes" className="py-32 px-6 md:px-12 lg:px-24 relative">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
               <div>
                 <h2 className="text-4xl font-serif mb-4">Choose Your Dread</h2>
                 <p className="text-muted-foreground max-w-xl">
                   Every fear is catered for. Our generative engine specializes in 10 distinct subgenres of cinematic horror.
                 </p>
               </div>
               <Link href="/studio/new">
                 <span className="flex items-center gap-2 text-primary uppercase tracking-widest text-xs font-bold hover:text-white transition-colors cursor-pointer group">
                   Start Generating <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
               </Link>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
               {[
                 { title: "Psychological", desc: "Is it real, or are you losing your mind?" },
                 { title: "Analog Horror", desc: "Cursed media, distorted signals, VHS decay." },
                 { title: "Body Horror", desc: "The betrayal of your own flesh." },
                 { title: "Folk Horror", desc: "Ancient rites and rural isolation." },
                 { title: "Cosmic", desc: "Insignificant specks facing incomprehensible vastness." },
                 { title: "Haunted Tech", desc: "Ghosts in the machine." },
                 { title: "Doppelgänger", desc: "Someone is taking your place." },
                 { title: "Creature", desc: "Hunted by something unnatural." },
                 { title: "Liminal", desc: "Trapped in endless, empty transitional spaces." },
                 { title: "Occult", desc: "Dark magic, cults, and forbidden knowledge." },
               ].map((theme, i) => (
                 <Link key={i} href="/studio/new">
                   <div className="group block h-48 border border-border bg-card p-4 relative overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                     <div className="absolute inset-0 bg-noise opacity-30 group-hover:opacity-50 transition-opacity" />
                     <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent z-0" />
                     
                     <div className="relative z-10 h-full flex flex-col justify-end">
                       <h3 className="font-serif text-lg text-foreground/90 group-hover:text-primary transition-colors">{theme.title}</h3>
                       <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                         {theme.desc}
                       </p>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
          </div>
        </section>
        
        {/* Footer CTA */}
        <section className="py-32 px-6 text-center border-t border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 cinematic-gradient opacity-80" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
             <h2 className="text-4xl md:text-5xl font-serif text-white">Every nightmare needs a protagonist.</h2>
             <Link href="/studio/new">
               <CinematicButton className="px-10 py-5 text-lg mt-8">
                 Become Yours
               </CinematicButton>
             </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-mono border ${className}`}>
      {children}
    </span>
  );
}
