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
        <div style={styles.title}>Plantasia</div>
        <div style={styles.subtitle}>Plant rotation planner</div>
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.button} onClick={signInWithGoogle}>
          Sign in with Google
        </button>
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
    justifyContent: 'center',
    gap: 16,
    fontFamily: '"Space Mono", monospace',
  },
  title: {
    fontSize: 24,
    color: COLORS.teal,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 32,
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
};
