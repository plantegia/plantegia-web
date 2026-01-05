import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACE_COLORS } from '../../constants';
import { getPlantBounds } from '../../utils/grid';
import { getEffectiveLightSchedule } from '../../utils/lightSchedule';
import { LightScheduleEditor } from './LightScheduleEditor';

interface SpaceInspectorProps {
  spaceId: string;
}

export function SpaceInspector({ spaceId }: SpaceInspectorProps) {
  const spaces = useAppStore((s) => s.spaces);
  const allPlants = useAppStore((s) => s.plants);
  const updateSpace = useAppStore((s) => s.updateSpace);
  const deleteSpace = useAppStore((s) => s.deleteSpace);
  const setSelection = useAppStore((s) => s.setSelection);

  const space = useMemo(() => spaces.find((sp) => sp.id === spaceId), [spaces, spaceId]);
  const plants = useMemo(() => allPlants.filter((p) => p.spaceId === spaceId), [allPlants, spaceId]);

  const [name, setName] = useState(space?.name || '');
  const [width, setWidth] = useState(space?.gridWidth || 2);
  const [height, setHeight] = useState(space?.gridHeight || 2);

  // Sync from store when spaceId changes or when space dimensions change externally (drag resize)
  useEffect(() => {
    if (space) {
      setName(space.name);
    }
  }, [spaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep width/height in sync with store (for drag resize)
  useEffect(() => {
    if (space) {
      setWidth(space.gridWidth);
      setHeight(space.gridHeight);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when grid dimensions change
  }, [space?.gridWidth, space?.gridHeight]);

  if (!space) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    updateSpace(spaceId, { name: newName });
  };

  const canResize = (newWidth: number, newHeight: number): boolean => {
    // Check if any plants would be outside the new bounds
    return !plants.some((plant) => {
      const { endX, endY } = getPlantBounds(plant);
      return endX > newWidth || endY > newHeight;
    });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Math.max(1, parseInt(e.target.value) || 1);
    setWidth(newWidth);
    if (canResize(newWidth, height)) {
      updateSpace(spaceId, { gridWidth: newWidth });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Math.max(1, parseInt(e.target.value) || 1);
    setHeight(newHeight);
    if (canResize(width, newHeight)) {
      updateSpace(spaceId, { gridHeight: newHeight });
    }
  };

  const handleLightScheduleChange = (newSchedule: number) => {
    updateSpace(spaceId, { customLightSchedule: newSchedule });
  };

  const handleColorChange = (color: string) => {
    updateSpace(spaceId, { color });
  };

  const handleDelete = () => {
    deleteSpace(spaceId);
    setSelection(null);
  };

  const inputStyle = {
    width: 50,
    padding: 6,
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'inherit',
    textAlign: 'center' as const,
  };

  return (
    <div style={{ color: COLORS.text, fontSize: 14 }}>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          style={{
            width: '100%',
            padding: 8,
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: COLORS.textMuted }}>Size:</span>
        <input
          type="number"
          value={width}
          onChange={handleWidthChange}
          min={1}
          style={inputStyle}
        />
        <span style={{ color: COLORS.textMuted }}>x</span>
        <input
          type="number"
          value={height}
          onChange={handleHeightChange}
          min={1}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <LightScheduleEditor
          schedule={getEffectiveLightSchedule(space)}
          onChange={handleLightScheduleChange}
        />
      </div>

      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: COLORS.textMuted }}>Color:</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {SPACE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{
                width: 24,
                height: 24,
                background: color,
                border: space.color === color ? `2px solid ${COLORS.teal}` : `1px solid ${COLORS.border}`,
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ color: COLORS.textMuted, marginBottom: 12 }}>
        {plants.length} plant{plants.length !== 1 ? 's' : ''}
      </div>

      <button
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: 10,
          background: COLORS.danger,
          border: 'none',
          color: COLORS.text,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        DELETE SPACE
      </button>
    </div>
  );
}
