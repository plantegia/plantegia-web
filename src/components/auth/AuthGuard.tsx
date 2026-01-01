import { useAuth } from '../../hooks/useAuth';
import { VIEWPORT_WIDTH, COLORS } from '../../constants';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.text}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <img
          src="/illustrations/heroplant.svg"
          alt="Plantasia hero plant"
          style={styles.heroImage}
        />
        <div style={styles.title}>Plantasia</div>
        <div style={styles.subtitle}>Know when to plant, flower, harvest, and plant again...</div>
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.button} onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        <div style={styles.copyright}>
          <div style={styles.copyrightMain}>
            Plan and track your plants in time and space. Free for grower community under AGPL-3.0.
          </div>
          <div style={styles.copyrightAuthor}>
            Created by Ivan Sokolov · 2025
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: VIEWPORT_WIDTH,
    height: '100dvh',
    margin: '0 auto',
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    fontFamily: '"Space Mono", monospace',
    padding: '80px 40px 40px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: 24,
    color: COLORS.teal,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 320,
  },
  text: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  error: {
    fontSize: 14,
    color: COLORS.danger,
    maxWidth: 300,
    textAlign: 'center',
  },
  button: {
    padding: '12px 24px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.teal,
    color: COLORS.background,
    border: 'none',
    cursor: 'pointer',
  },
  heroImage: {
    width: 300,
    height: 300,
  },
  copyright: {
    position: 'absolute',
    bottom: 16,
    textAlign: 'center',
    maxWidth: 340,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  copyrightMain: {
    fontSize: 12,
    color: COLORS.textMuted,
    opacity: 0.7,
    lineHeight: 1.5,
  },
  copyrightAuthor: {
    fontSize: 11,
    color: COLORS.textMuted,
    opacity: 0.4,
  },
};
