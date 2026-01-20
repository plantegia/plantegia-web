import { useAppStore } from '../../store/useAppStore';
import { ToolButton } from './ToolButton';
import { COLORS, BASE_URL } from '../../constants';
import { useIsMobile } from '../../hooks/useIsMobile';

const TOOL_ICONS: Record<string, string> = {
  cursor: `${BASE_URL}cursors/cursor.svg`,
  space: `${BASE_URL}cursors/space.svg`,
  erase: `${BASE_URL}cursors/erase.svg`,
  split: `${BASE_URL}cursors/split.svg`,
};

export function Toolbox() {
  const isMobile = useIsMobile();
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const viewMode = useAppStore((s) => s.viewMode);
  const selectedSeedId = useAppStore((s) => s.selectedSeedId);
  const expandedSection = useAppStore((s) => s.expandedHotbarSection);
  const setExpandedSection = useAppStore((s) => s.setExpandedHotbarSection);

  // On desktop always show expanded, on mobile respect expandedSection
  const isExpanded = !isMobile || expandedSection === 'toolbox';
  const currentTool = activeTool || 'cursor';
  const currentIcon = TOOL_ICONS[currentTool] || TOOL_ICONS.cursor;

  // Collapsed view
  if (!isExpanded) {
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
          onClick={() => setExpandedSection('toolbox')}
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            marginBottom: 6,
            cursor: 'pointer',
          }}
        >
          Tools ›
        </span>
        <ToolButton
          icon={currentIcon}
          active={!selectedSeedId}
          onClick={() => setExpandedSection('toolbox')}
        />
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            marginTop: 4,
          }}
        >
          {currentTool}
        </span>
      </div>
    );
  }

  // Expanded view
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
          icon={TOOL_ICONS.cursor}
          label="Cursor"
          dataTool="cursor"
          active={(activeTool === 'cursor' || activeTool === null) && !selectedSeedId}
          onClick={() => setActiveTool('cursor')}
        />
        <ToolButton
          icon={TOOL_ICONS.space}
          label="Space"
          dataTool="space"
          active={activeTool === 'space'}
          onClick={() => setActiveTool(activeTool === 'space' ? 'cursor' : 'space')}
        />
        {viewMode === 'time' && (
          <ToolButton
            icon={TOOL_ICONS.split}
            label="Split"
            dataTool="split"
            active={activeTool === 'split'}
            onClick={() => setActiveTool(activeTool === 'split' ? 'cursor' : 'split')}
          />
        )}
        <ToolButton
          icon={TOOL_ICONS.erase}
          label="Erase"
          dataTool="erase"
          active={activeTool === 'erase'}
          onClick={() => setActiveTool(activeTool === 'erase' ? 'cursor' : 'erase')}
        />
      </div>
    </div>
  );
}
