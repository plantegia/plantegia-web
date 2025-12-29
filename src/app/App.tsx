import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PlantationList } from '../components/pages/PlantationList';
import { PlantationView } from '../components/pages/PlantationView';

export function App() {
  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<PlantationList />} />
        <Route path="/p/:id" element={<PlantationView />} />
      </Routes>
    </AuthGuard>
  );
}
