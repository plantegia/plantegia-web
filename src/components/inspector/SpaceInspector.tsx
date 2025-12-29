import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants';

interface SpaceInspectorProps {
  spaceId: string;
}

export function SpaceInspector({ spaceId }: SpaceInspectorProps) {
  const space = useAppStore((s) => s.spaces.find((sp) => sp.id === spaceId));
  const plants = useAppStore((s) => s.plants.filter((p) => p.spaceId === spaceId));
  const updateSpace = useAppStore((s) => s.updateSpace);
  const deleteSpace = useAppStore((s) => s.deleteSpace);
  const setSelection = useAppStore((s) => s.setSelection);

  const [name, setName] = useState(space?.name || '');

  useEffect(() => {
    if (space) {
      setName(space.name);
    }
  }, [space]);

  if (!space) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    updateSpace(spaceId, { name: newName });
  };

  const handleDelete = () => {
    deleteSpace(spaceId);
    setSelection(null);
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

      <div style={{ color: COLORS.textMuted, marginBottom: 8 }}>
        {space.gridWidth} x {space.gridHeight} cells
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
