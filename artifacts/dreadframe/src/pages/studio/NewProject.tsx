import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, SectionHeader, CinematicButton } from '@/components/ui-custom';
import { Camera, Upload, Edit3, Shuffle, ChevronRight } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

const HORROR_VARIATIONS = [
  "Possessed", "Doppelgänger", "Analog Nightmare", "Victorian Ghost",
  "Cosmic Infection", "Creature Transformation", "Found Footage Survivor",
  "Liminal Horror", "Cult Initiate", "Something Wearing Your Face"
];

export default function NewProject() {
  const [step, setStep] = useState<1 | 2>(1);
  const { dispatch } = useProject();
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<'camera' | 'photo' | 'idea' | 'surprise' | null>(null);
  const [idea, setIdea] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleModeSelect = (selectedMode: typeof mode) => {
    setMode(selectedMode);
    if (selectedMode === 'surprise') {
      setStep(2);
    } else if (selectedMode === 'camera') {
      setLocation('/studio/camera');
    } else if (selectedMode === 'photo') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      dispatch({ type: 'UPDATE_PROJECT', payload: { userPhotoUrl: dataUrl, mode: 'photo' } });
      setMode('photo');
    };
    reader.readAsDataURL(file);
  };

  const handleIdeaSubmit = () => {
    if (idea.trim()) setStep(2);
  };

  const handleVariationSelect = (variation: string) => {
    const prompt = mode === 'idea' ? idea : `A ${variation} horror story featuring me.`;
    
    dispatch({ 
      type: 'UPDATE_PROJECT', 
      payload: { 
        userPrompt: prompt,
        mode: mode as any,
        title: `Untitled ${variation} Project`,
        // Clear existing data for fresh generation
        concept: null,
        storyBible: null,
        character: null,
        characterArc: null,
        sequences: [],
        shots: {},
        storyboardFrames: {},
        endings: []
      }
    });
    
    // Send to horror lab to generate concepts
    setLocation('/studio/horror-lab');
  };

  return (
    <div className="py-12 px-8 max-w-4xl mx-auto animate-fade-in-slow">
      <SectionHeader 
        title={step === 1 ? "What are we afraid of tonight?" : "What should happen to you?"} 
        subtitle={step === 1 ? "Select an entry point to ground the horror." : "Choose the vector of your demise."}
      />
      
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Hidden file input for photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Card 
            hover 
            className={`p-8 flex flex-col items-center justify-center text-center gap-4 ${mode === 'camera' ? 'border-primary' : ''}`}
            onClick={() => handleModeSelect('camera')}
          >
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-serif text-xl mb-2">Use My Camera</h3>
              <p className="text-sm text-muted-foreground">Capture your face right now to cast yourself in the nightmare.</p>
            </div>
          </Card>

          <Card 
            hover 
            className={`p-8 flex flex-col items-center justify-center text-center gap-4 ${mode === 'photo' ? 'border-primary' : ''}`}
            onClick={() => handleModeSelect('photo')}
          >
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Uploaded" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-serif text-xl mb-2">Upload a Photo</h3>
              <p className="text-sm text-muted-foreground">
                {photoPreview ? 'Photo loaded — continue below.' : 'Provide an existing photo to serve as the protagonist\'s reference.'}
              </p>
            </div>
            {photoPreview && (
              <CinematicButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setStep(2); }}>
                Continue <ChevronRight className="w-4 h-4" />
              </CinematicButton>
            )}
          </Card>

          <Card 
            className={`p-8 col-span-1 md:col-span-2 ${mode === 'idea' ? 'border-primary' : ''}`}
          >
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-background border border-border flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="font-serif text-xl mb-2" onClick={() => setMode('idea')}>Start With an Idea</h3>
                <textarea 
                  value={idea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setMode('idea');
                  }}
                  placeholder="Describe the beginning of your nightmare... (e.g. 'I wake up in a hospital, but all the doctors are mannequins')"
                  className="w-full bg-background border border-border rounded p-4 text-sm min-h-[100px] focus:outline-none focus:border-primary transition-colors text-foreground"
                />
                {mode === 'idea' && (
                  <div className="mt-4 flex justify-end">
                    <CinematicButton onClick={handleIdeaSubmit} disabled={!idea.trim()}>
                      Continue <ChevronRight className="w-4 h-4" />
                    </CinematicButton>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
             <button 
               onClick={() => handleModeSelect('surprise')}
               className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-mono"
             >
               <Shuffle className="w-4 h-4" /> Surprise Me
             </button>
          </div>

        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
          {HORROR_VARIATIONS.map((variation) => (
            <button
              key={variation}
              onClick={() => handleVariationSelect(variation)}
              className="p-6 text-left border border-border bg-card hover:border-primary/50 hover:bg-white/5 transition-all group flex justify-between items-center"
            >
              <span className="font-serif text-lg text-foreground/90 group-hover:text-white transition-colors">{variation}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
