import { Header } from '../components/ui/Header';
import { Canvas } from '../components/canvas/Canvas';
import { Hotbar } from '../components/hotbar/Hotbar';
import { Inspector } from '../components/inspector/Inspector';
import { COLORS } from '../constants';

export function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <Header />
      <Canvas />
      <Inspector />
      <Hotbar />
    </div>
  );
}
