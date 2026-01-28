import { useAuth } from '../../hooks/useAuth';
import { VIEWPORT_WIDTH, COLORS, BASE_URL } from '../../constants';
import { AppHeader } from '../ui/AppHeader';

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
        <AppHeader onAction={signInWithGoogle} actionType="login" />
        <div style={styles.content}>
          <img
            src={`${BASE_URL}illustrations/heroplant.svg`}
            alt="Plantegia hero plant"
            style={styles.heroImage}
          />
          <div style={styles.title}>Organize your grow across time and space</div>
          <div style={styles.subtitle}>Know when to seed, flip, harvest, and seed again.</div>
          {error && <div style={styles.error}>{error}</div>}
          <button className="btn-primary" style={styles.button} onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
        <div style={styles.copyright}>
          <div style={styles.copyrightAuthor}>
            Created by <a href="https://www.linkedin.com/in/ivansokolov2017/" target="_blank" rel="noopener noreferrer" style={styles.authorLink}>Vanya</a> · 2026
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
    minHeight: '100dvh',
    margin: '0 auto',
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Space Mono", monospace',
    padding: 20,
    boxSizing: 'border-box',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingTop: 40,
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
    textAlign: 'center',
    paddingBottom: 16,
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
