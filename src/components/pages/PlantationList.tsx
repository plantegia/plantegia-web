import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserPlantations, createPlantation, deletePlantation } from '../../lib/firestore';
import { VIEWPORT_WIDTH, COLORS, FEATURES } from '../../constants';
import type { Plantation } from '../../types';

export function PlantationList() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Plantation | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await deletePlantation(deleteConfirm.id);
      setPlantations((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
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
        <div style={styles.title}>Plantegia</div>
        <button style={styles.signOutButton} onClick={signOut}>
          Sign out
        </button>
      </div>

      {FEATURES.TUTORIALS && (
        <div style={styles.tutorialSection}>
          <div style={styles.sectionTitle}>Tutorials</div>
          <div style={styles.tutorialGrid}>
            <button
              style={styles.tutorialButton}
              onClick={() => navigate('/tutorial/basic-setup')}
            >
              <div style={styles.tutorialNumber}>1.</div>
              <div style={styles.tutorialName}>Basic Setup</div>
              <div style={styles.tutorialDesc}>Create spaces and plants</div>
            </button>
            <button
              style={styles.tutorialButton}
              onClick={() => navigate('/tutorial/timeline-rotation')}
            >
              <div style={styles.tutorialNumber}>2.</div>
              <div style={styles.tutorialName}>Timeline & Rotation</div>
              <div style={styles.tutorialDesc}>Plan growth cycles</div>
            </button>
          </div>
        </div>
      )}

      {plantations.length === 0 && (
        <img
          src="/illustrations/heroplant.svg"
          alt="Plantegia hero plant"
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
            <div key={p.id} style={styles.plantationRow}>
              <button
                style={styles.plantationItem}
                onClick={() => navigate(`/p/${p.id}`)}
              >
                <div style={styles.plantationName}>{p.name}</div>
                <div style={styles.plantationMeta}>
                  {p.plants.length} plants · {p.spaces.length} spaces
                </div>
              </button>
              <button
                style={styles.deleteButton}
                onClick={() => setDeleteConfirm(p)}
                title="Delete plantation"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmDialog}>
            <div style={styles.confirmTitle}>Delete plantation?</div>
            <div style={styles.confirmName}>"{deleteConfirm.name}"</div>
            <div style={styles.confirmWarning}>
              This will permanently delete {deleteConfirm.plants.length} plants
              and {deleteConfirm.spaces.length} spaces.
            </div>
            <div style={styles.confirmButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                style={styles.confirmDeleteButton}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  plantationRow: {
    display: 'flex',
    gap: 0,
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
    flex: 1,
  },
  deleteButton: {
    width: 48,
    backgroundColor: COLORS.backgroundDark,
    border: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    color: COLORS.textMuted,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  tutorialSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 12,
  },
  tutorialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
  },
  tutorialButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    textAlign: 'left',
  },
  tutorialNumber: {
    fontSize: 18,
    color: COLORS.teal,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tutorialName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tutorialDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  confirmDialog: {
    width: VIEWPORT_WIDTH - 40,
    backgroundColor: COLORS.backgroundDark,
    padding: 20,
    border: `1px solid ${COLORS.border}`,
  },
  confirmTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confirmName: {
    fontSize: 14,
    color: COLORS.teal,
    marginBottom: 12,
  },
  confirmWarning: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: 20,
    lineHeight: 1.4,
  },
  confirmButtons: {
    display: 'flex',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.background,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
  },
  confirmDeleteButton: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.danger,
    color: COLORS.background,
    border: 'none',
    cursor: 'pointer',
  },
};
