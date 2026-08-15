import { cn } from '@/lib/utils';
import { type ReactNode, type HTMLAttributes, type MouseEventHandler } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & { hover?: boolean };

export function Card({ children, className, hover = false, onClick, ...rest }: CardProps) {
  return (
    <div 
      onClick={onClick}
      {...rest}
      className={cn(
        "bg-card text-card-foreground rounded-lg border border-border/50",
        "relative overflow-hidden transition-all duration-300",
        hover && "hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,26,26,0.15)] group cursor-pointer",
        onClick && !hover && "cursor-pointer",
        className
      )}
    >
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-2xl font-serif text-foreground/90 uppercase tracking-widest">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      <div className="w-12 h-px bg-primary/50 mt-4" />
    </div>
  );
}

export function CinematicButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className, 
  disabled,
  isLoading 
}: { 
  children: ReactNode; 
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'; 
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "relative px-6 py-3 font-serif tracking-widest uppercase text-sm transition-all duration-300 overflow-hidden",
        "disabled:opacity-50 disabled:cursor-not-allowed group",
        variant === 'primary' && "bg-primary/90 text-white hover:bg-primary border border-primary",
        variant === 'ghost' && "bg-transparent text-foreground hover:bg-white/5 border border-transparent",
        variant === 'outline' && "bg-transparent text-foreground border border-border hover:border-primary/50 hover:text-primary",
        variant === 'danger' && "bg-transparent text-destructive hover:bg-destructive/10 border border-destructive/30 hover:border-destructive",
        className
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-noise opacity-20 pointer-events-none",
        variant === 'primary' ? 'opacity-20' : 'opacity-0'
      )} />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <span className="animate-pulse">Processing...</span>
        ) : children}
      </span>
    </button>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono tracking-wider border",
      "bg-background/50 border-border text-muted-foreground uppercase",
      className
    )}>
      {children}
    </span>
  );
}
