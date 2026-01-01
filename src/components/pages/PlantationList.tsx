import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserPlantations, createPlantation } from '../../lib/firestore';
import { VIEWPORT_WIDTH, COLORS } from '../../constants';
import type { Plantation } from '../../types';

export function PlantationList() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;

    getUserPlantations(user.uid)
      .then(setPlantations)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;

    setCreating(true);
    try {
      const plantation = await createPlantation(user.uid, newName.trim());
      navigate(`/p/${plantation.id}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Plantasia</div>
        <button style={styles.signOutButton} onClick={signOut}>
          Sign out
        </button>
      </div>

      {plantations.length === 0 && (
        <img
          src="/illustrations/heroplant.svg"
          alt="Plantasia hero plant"
          style={styles.heroImage}
        />
      )}

      <div style={styles.createSection}>
        <input
          style={styles.input}
          placeholder="New plantation name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          style={styles.createButton}
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
        >
          {creating ? '...' : '+'}
        </button>
      </div>

      <div style={styles.list}>
        {plantations.length === 0 ? (
          <div style={styles.empty}>No plantations yet. Create one above.</div>
        ) : (
          plantations.map((p) => (
            <button
              key={p.id}
              style={styles.plantationItem}
              onClick={() => navigate(`/p/${p.id}`)}
            >
              <div style={styles.plantationName}>{p.name}</div>
              <div style={styles.plantationMeta}>
                {p.plants.length} plants · {p.spaces.length} spaces
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: VIEWPORT_WIDTH,
    minHeight: '100dvh',
    margin: '0 auto',
    backgroundColor: COLORS.background,
    fontFamily: '"Space Mono", monospace',
    padding: 20,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    color: COLORS.teal,
    fontWeight: 'bold',
  },
  signOutButton: {
    fontSize: 14,
    color: COLORS.textMuted,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
  },
  createSection: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.backgroundDark,
    color: COLORS.text,
    border: 'none',
    outline: 'none',
  },
  createButton: {
    width: 48,
    fontSize: 18,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.teal,
    color: COLORS.background,
    border: 'none',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  plantationItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: COLORS.backgroundDark,
    border: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    textAlign: 'left',
    width: '100%',
  },
  plantationName: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  plantationMeta: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  loading: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 100,
  },
  empty: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  heroImage: {
    width: 200,
    height: 200,
    margin: '40px auto 24px',
    display: 'block',
  },
};
