import { useEffect } from 'react';
import { useGenerateStoryBible } from '@workspace/api-client-react';
import { useProject } from '@/context/ProjectContext';
import { Card, SectionHeader } from '@/components/ui-custom';

export default function StoryBible() {
  const { state, dispatch } = useProject();
  const generateBible = useGenerateStoryBible();

  const concept = state.project.concept;
  const bible = state.project.storyBible;

  useEffect(() => {
    if (concept && !bible && !generateBible.isPending && !generateBible.data) {
      generateBible.mutate({
        data: { concept }
      }, {
        onSuccess: (data) => {
          dispatch({ type: 'UPDATE_PROJECT', payload: { storyBible: data } });
        }
      });
    }
  }, [concept, bible]);

  if (!concept) {
    return <div className="p-12 text-center text-muted-foreground">Select a concept in the Horror Lab first.</div>;
  }

  if (generateBible.isPending) {
    return (
      <div className="p-12 max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-border/50 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-card/50 rounded border border-border/50" />)}
        </div>
      </div>
    );
  }

  const sections = bible ? [
    { key: 'premise', label: 'Premise', val: bible.premise, col: 2 },
    { key: 'logline', label: 'Logline', val: bible.logline, col: 2 },
    { key: 'theme', label: 'Theme', val: bible.theme, col: 1 },
    { key: 'centralFear', label: 'Central Fear', val: bible.centralFear, col: 1 },
    { key: 'horrorRule', label: 'Horror Rule', val: bible.horrorRule, col: 1 },
    { key: 'stakes', label: 'Stakes', val: bible.stakes, col: 1 },
    { key: 'mystery', label: 'The Mystery', val: bible.mystery, col: 1 },
    { key: 'reveal', label: 'The Reveal', val: bible.reveal, col: 1 },
  ] : [];

  return (
    <div className="py-12 px-8 max-w-5xl mx-auto animate-fade-in-slow">
      <SectionHeader 
        title="Story Bible" 
        subtitle="The foundational rules and structure of your nightmare." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {sections.map(sec => (
          <Card key={sec.key} className={`p-6 group ${sec.col === 2 ? 'md:col-span-2' : ''}`}>
            <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-2">
              <span className="text-xs uppercase tracking-widest text-primary font-mono">{sec.label}</span>
            </div>
            
            {/* Using a controlled textarea to simulate inline editing. 
                In a real app, this would debounce and save to context/server. */}
            <textarea 
              defaultValue={sec.val}
              className="w-full bg-transparent text-foreground/90 leading-relaxed resize-none focus:outline-none min-h-[80px]"
              onChange={(e) => {
                if (bible) {
                  dispatch({ 
                    type: 'UPDATE_PROJECT', 
                    payload: { storyBible: { ...bible, [sec.key]: e.target.value } } 
                  });
                }
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
