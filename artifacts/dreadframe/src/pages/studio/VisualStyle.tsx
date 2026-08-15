import { SectionHeader, Card } from '@/components/ui-custom';
import { useProject } from '@/context/ProjectContext';
import { Check } from 'lucide-react';

const STYLES = [
  { id: 'cinematic', name: 'Cinematic Modern', desc: 'Crisp, high-contrast, anamorphic lenses, A24 aesthetic.' },
  { id: 'analog', name: 'Analog VHS', desc: 'Degraded tracking, harsh lighting, saturated bleeding colors.' },
  { id: 'found_footage', name: 'Found Footage', desc: 'Handheld, motion blur, camcorder artifacts, harsh flashlights.' },
  { id: 'victorian', name: 'Gothic Tintype', desc: 'Sepia tones, long exposure blur, heavy shadows, dust.' },
  { id: 'surreal', name: 'Dream Logic', desc: 'Impossible geometries, oversaturated primary colors, soft focus.' },
  { id: 'liminal', name: 'Liminal Corporate', desc: 'Fluorescent hum, flat lighting, endless beige carpets.' },
];

export default function VisualStyle() {
  const { state, dispatch } = useProject();
  const currentStyle = state.project.visualStyle;

  return (
    <div className="py-12 px-8 max-w-5xl mx-auto animate-fade-in-slow">
      <SectionHeader 
        title="Visual Tone" 
        subtitle="Dictate the aesthetic rendering parameters for all generated imagery."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {STYLES.map(style => (
          <Card 
            key={style.id} 
            className={`p-6 cursor-pointer border-2 transition-all duration-300 ${currentStyle === style.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
            onClick={() => dispatch({ type: 'UPDATE_PROJECT', payload: { visualStyle: style.id }})}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif text-lg">{style.name}</h3>
              {currentStyle === style.id && <Check className="w-5 h-5 text-primary" />}
            </div>
            
            {/* Visual placeholder box */}
            <div className="w-full aspect-video bg-black mb-4 relative overflow-hidden flex items-center justify-center border border-border">
              <div className="absolute inset-0 bg-noise opacity-50" />
              {style.id === 'cinematic' && <div className="absolute inset-0 cinematic-gradient" />}
              {style.id === 'analog' && <div className="absolute inset-0 bg-red-900/20 mix-blend-color-burn" />}
              {style.id === 'liminal' && <div className="absolute inset-0 bg-yellow-900/10" />}
              
              <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest relative z-10">
                Aesthetic Sample
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground">{style.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
