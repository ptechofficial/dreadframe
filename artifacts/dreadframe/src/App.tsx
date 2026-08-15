import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
  Redirect,
} from 'wouter';

import { ProjectProvider } from '@/context/ProjectContext';
import StudioLayout from '@/components/StudioLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import Overview from '@/pages/studio/Overview';
import NewProject from '@/pages/studio/NewProject';
import HorrorLab from '@/pages/studio/HorrorLab';
import StoryBible from '@/pages/studio/StoryBible';
import Characters from '@/pages/studio/Characters';
import Arcs from '@/pages/studio/Arcs';
import Sequences from '@/pages/studio/Sequences';
import Shots from '@/pages/studio/Shots';
import Gallery from '@/pages/studio/Gallery';
import Camera from '@/pages/studio/Camera';
import VisualStyle from '@/pages/studio/VisualStyle';
import Endings from '@/pages/studio/Endings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  }
});

function StudioRouter() {
  return (
    <StudioLayout>
      <Switch>
        <Route path="/studio" component={() => <Redirect to="/studio/overview" />} />
        <Route path="/studio/overview" component={Overview} />
        <Route path="/studio/new" component={NewProject} />
        <Route path="/studio/horror-lab" component={HorrorLab} />
        <Route path="/studio/story" component={StoryBible} />
        <Route path="/studio/characters" component={Characters} />
        <Route path="/studio/arcs" component={Arcs} />
        <Route path="/studio/sequences" component={Sequences} />
        <Route path="/studio/shots" component={Shots} />
        <Route path="/studio/gallery" component={Gallery} />
        <Route path="/studio/camera" component={Camera} />
        <Route path="/studio/visual-style" component={VisualStyle} />
        <Route path="/studio/endings" component={Endings} />
        <Route component={NotFound} />
      </Switch>
    </StudioLayout>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/studio/*" component={StudioRouter} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
