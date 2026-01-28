import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserPlantations, createPlantation, deletePlantation } from '../../lib/firestore';
import { VIEWPORT_WIDTH, COLORS, FEATURES, BASE_URL } from '../../constants';
import { AppHeader } from '../ui/AppHeader';
import { TUTORIALS } from '../../tutorial';
import type { Plantation } from '../../types';

export function PlantationList() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Plantation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tutorialsOpen, setTutorialsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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

  // Build tutorial list (combining available and existing tutorials)
  const { tutorialItems, regularPlantations } = useMemo(() => {
    if (!FEATURES.TUTORIALS) {
      return { tutorialItems: [], regularPlantations: plantations };
    }

    // Map existing tutorial plantations by tutorialId
    const existingTutorials = new Map(
      plantations.filter(p => p.tutorialId).map(p => [p.tutorialId, p])
    );

    // Build ordered tutorial items
    const items = Object.entries(TUTORIALS).map(([tutorialId, tutorial], index) => {
      const existing = existingTutorials.get(tutorialId);
      return {
        tutorialId,
        index: index + 1,
        name: tutorial.name,
        description: tutorial.description,
        plantation: existing || null,
      };
    });

    // Regular plantations (non-tutorial) sorted by updatedAt
    const regular = plantations
      .filter(p => !p.tutorialId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return { tutorialItems: items, regularPlantations: regular };
  }, [plantations]);

  if (authLoading || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  // Not logged in - show login screen
  if (!user) {
    return (
      <div style={styles.container}>
        <AppHeader onAction={signInWithGoogle} actionType="login" />
        <div style={styles.loginContent}>
          <img
            src={`${BASE_URL}illustrations/heroplant.svg`}
            alt="Plantegia hero plant"
            style={styles.heroImageLarge}
          />
          <div style={styles.title}>Organize your grow across time and space</div>
          <div style={styles.subtitle}>Know when to seed, flip, harvest, and seed again.</div>
          {authError && <div style={styles.error}>{authError}</div>}
          <button className="btn-primary" style={styles.signInButton} onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
        <div style={styles.copyright}>
          <div style={styles.copyrightAuthor}>
            Created by Vanya · <a href="mailto:builder@plantegia.com" style={styles.authorLink}>builder@plantegia.com</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AppHeader onAction={signOut} actionType="logout" />

      <img
        src={`${BASE_URL}illustrations/heroplant.svg`}
        alt="Plantegia hero plant"
        style={styles.heroImageLarge}
      />

      <div style={styles.list}>
        {/* Tutorials accordion */}
        {FEATURES.TUTORIALS && tutorialItems.length > 0 && (
          <>
            <button
              className="btn-icon"
              style={styles.accordionHeader}
              onClick={() => setTutorialsOpen(!tutorialsOpen)}
            >
              {tutorialsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Tutorials</span>
            </button>
            {tutorialsOpen && tutorialItems.map((t) => (
              <div key={`tutorial-${t.tutorialId}`} style={styles.plantationRow}>
                <button
                  className="btn-secondary"
                  style={styles.listItem}
                  onClick={() => t.plantation
                    ? navigate(`/p/${t.plantation.id}`)
                    : navigate(`/tutorial/${t.tutorialId}`)
                  }
                >
                  <div style={styles.itemLabel}>{String.fromCharCode(64 + t.index)}. {t.name}</div>
                  <div style={styles.plantationMeta}>
                    {t.plantation
                      ? `${t.plantation.plants.length} plants · ${t.plantation.spaces.length} spaces`
                      : t.description
                    }
                  </div>
                </button>
                {t.plantation ? (
                  <button
                    className="btn-secondary"
                    style={styles.deleteButton}
                    onClick={() => setDeleteConfirm(t.plantation)}
                    title="Delete plantation"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    style={styles.actionButton}
                    onClick={() => navigate(`/tutorial/${t.tutorialId}`)}
                    title="Start tutorial"
                  >
                    <Play size={14} />
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* Regular plantations */}
        {regularPlantations.map((p, index) => {
          const itemNumber = index + 1;
          return (
            <div key={p.id} style={styles.plantationRow}>
              <button
                className="btn-secondary"
                style={styles.listItem}
                onClick={() => navigate(`/p/${p.id}`)}
              >
                <div style={styles.itemLabel}>{itemNumber}. {p.name}</div>
                <div style={styles.plantationMeta}>
                  {p.plants.length} plants · {p.spaces.length} spaces
                </div>
              </button>
              <button
                className="btn-secondary"
                style={styles.deleteButton}
                onClick={() => setDeleteConfirm(p)}
                title="Delete plantation"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {/* New plantation input */}
        {(() => {
          const newItemNumber = regularPlantations.length + 1;
          return (
            <div style={styles.plantationRow}>
              <div style={styles.inputItem}>
                <span style={styles.inputNumber}>{newItemNumber}.</span>
                <input
                  style={styles.inlineInput}
                  placeholder="New plantation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <button
                className="btn-secondary"
                style={styles.addButton}
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating ? '...' : '+'}
              </button>
            </div>
          );
        })()}
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
                className="btn-secondary"
                style={styles.cancelButton}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
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

      <div style={styles.copyright}>
        <div style={styles.copyrightAuthor}>
          Created by Vanya · <a href="mailto:builder@plantegia.com" style={styles.authorLink}>builder@plantegia.com</a>
        </div>
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
    display: 'flex',
    flexDirection: 'column',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'left',
  },
  plantationRow: {
    display: 'flex',
    gap: 0,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0 16px',
    height: 64,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    textAlign: 'left',
    flex: 1,
    boxSizing: 'border-box',
  },
  itemLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  deleteButton: {
    width: 48,
    height: 64,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    borderLeft: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    color: COLORS.textMuted,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  actionButton: {
    width: 48,
    height: 64,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    borderLeft: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    color: COLORS.text,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  inputItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: '0 16px',
    height: 64,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    fontFamily: '"Space Mono", monospace',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    boxSizing: 'border-box',
  },
  inputNumber: {
    color: COLORS.text,
  },
  addButton: {
    width: 48,
    height: 64,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    borderLeft: 'none',
    cursor: 'pointer',
    fontFamily: '"Space Mono", monospace',
    color: COLORS.text,
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  inlineInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: 'transparent',
    color: COLORS.text,
    border: 'none',
    outline: 'none',
    padding: 0,
  },
  plantationMeta: {
    fontSize: 14,
    color: COLORS.textMuted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  loading: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 100,
  },
  heroImageLarge: {
    width: 300,
    height: 300,
    margin: '20px auto 16px',
    display: 'block',
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
  loginContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    color: COLORS.teal,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 320,
  },
  error: {
    fontSize: 14,
    color: COLORS.danger,
    maxWidth: 300,
    textAlign: 'center',
  },
  signInButton: {
    padding: '12px 24px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.teal,
    color: COLORS.background,
    border: 'none',
    cursor: 'pointer',
  },
  copyright: {
    textAlign: 'center',
    paddingBottom: 16,
    marginTop: 'auto',
  },
  copyrightAuthor: {
    fontSize: 11,
    color: COLORS.textMuted,
    opacity: 0.4,
  },
  authorLink: {
    color: 'inherit',
    textDecoration: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '2px',
  },
};
