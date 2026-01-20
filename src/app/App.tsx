import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PlantationList } from '../components/pages/PlantationList';
import { PlantationView } from '../components/pages/PlantationView';
import { TutorialView } from '../components/pages/TutorialView';
import { TutorialProvider } from '../tutorial';
import { FEATURES } from '../constants';

export function App() {
  const routes = (
    <Routes>
      <Route path="/p/" element={<PlantationList />} />
      <Route path="/p/:id" element={<PlantationView />} />
      {FEATURES.TUTORIALS && (
        <Route path="/tutorial/:tutorialId" element={<TutorialView />} />
      )}
    </Routes>
  );

  return (
    <AuthGuard>
      {FEATURES.TUTORIALS ? (
        <TutorialProvider>{routes}</TutorialProvider>
      ) : (
        routes
      )}
    </AuthGuard>
  );
}
