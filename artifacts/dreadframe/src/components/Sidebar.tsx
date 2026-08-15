import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Film, 
  Image as ImageIcon, 
  Camera, 
  Settings, 
  Activity,
  Clapperboard,
  Sparkles
} from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

const NAV_ITEMS = [
  {
    group: "Project",
    items: [
      { name: 'Overview', path: '/studio/overview', icon: LayoutDashboard },
      { name: 'Story', path: '/studio/story', icon: BookOpen },
      { name: 'Characters', path: '/studio/characters', icon: Users },
      { name: 'Themes & Arcs', path: '/studio/arcs', icon: Activity },
    ]
  },
  {
    group: "Storyboard",
    items: [
      { name: 'Sequences', path: '/studio/sequences', icon: Film },
      { name: 'Shots', path: '/studio/shots', icon: Clapperboard },
      { name: 'Gallery', path: '/studio/gallery', icon: ImageIcon },
      { name: 'Endings', path: '/studio/endings', icon: Sparkles },
    ]
  },
  {
    group: "Director",
    items: [
      { name: 'Camera', path: '/studio/camera', icon: Camera },
      { name: 'Horror Lab', path: '/studio/horror-lab', icon: Settings },
      { name: 'Visual Style', path: '/studio/visual-style', icon: Settings },
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const { state } = useProject();

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-full flex flex-col relative z-20">
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-50" />
      
      <div className="p-6 border-b border-border/50 relative z-10">
        <Link href="/" className="font-serif text-xl tracking-[0.2em] text-primary block hover:text-primary-foreground transition-colors">
          DREADFRAME
        </Link>
        <div className="mt-2 text-xs text-muted-foreground font-mono truncate" title={state.project.title}>
          {state.project.title || "Untitled Nightmare"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 relative z-10">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-6">
            <h3 className="px-6 mb-2 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              {group.group}
            </h3>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-6 py-2 text-sm font-medium transition-all",
                      isActive 
                        ? "text-primary bg-primary/10 border-r-2 border-primary" 
                        : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border/50 relative z-10">
         <Link href="/studio/new" className="w-full flex justify-center text-xs tracking-widest uppercase border border-border py-2 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
           New Project
         </Link>
      </div>
    </aside>
  );
}
