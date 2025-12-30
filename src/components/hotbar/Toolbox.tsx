import { useAppStore } from '../../store/useAppStore';
import { ToolButton } from './ToolButton';
import { COLORS } from '../../constants';

export function Toolbox() {
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const viewMode = useAppStore((s) => s.viewMode);
  const selectedSeedId = useAppStore((s) => s.selectedSeedId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 12px 12px',
        background: COLORS.backgroundDark,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Toolbox
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <ToolButton
          icon="/cursors/cursor.svg"
          label="Cursor"
          active={(activeTool === 'cursor' || activeTool === null) && !selectedSeedId}
          onClick={() => setActiveTool('cursor')}
        />
        {viewMode === 'space' ? (
          <>
            <ToolButton
              icon="/cursors/space.svg"
              label="Space"
              active={activeTool === 'space'}
              onClick={() => setActiveTool(activeTool === 'space' ? 'cursor' : 'space')}
            />
            <ToolButton
              icon="/cursors/erase.svg"
              label="Erase"
              active={activeTool === 'erase'}
              onClick={() => setActiveTool(activeTool === 'erase' ? 'cursor' : 'erase')}
            />
          </>
        ) : (
          <>
            <ToolButton
              icon="/cursors/split.svg"
              label="Split"
              active={activeTool === 'split'}
              onClick={() => setActiveTool(activeTool === 'split' ? 'cursor' : 'split')}
            />
            <ToolButton
              icon="/cursors/erase.svg"
              label="Erase"
              active={activeTool === 'erase'}
              onClick={() => setActiveTool(activeTool === 'erase' ? 'cursor' : 'erase')}
            />
          </>
        )}
      </div>
    </div>
  );
}
