import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DirectorPanel } from '@/components/DirectorPanel';

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden">
      <div className="film-grain" />
      <Sidebar />
      <main className="flex-1 relative z-10 overflow-y-auto bg-background/95 custom-scrollbar flex flex-col">
        {/* Main view area */}
        <div className="flex-1 w-full max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      <DirectorPanel />
    </div>
  );
}
