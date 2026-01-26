import { Routes, Route, Navigate } from 'react-router-dom';
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
      <Route path="*" element={<Navigate to="/p/" replace />} />
    </Routes>
  );

  return FEATURES.TUTORIALS ? (
    <TutorialProvider>{routes}</TutorialProvider>
  ) : (
    routes
  );
}
