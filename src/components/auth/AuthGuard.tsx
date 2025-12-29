import { useAuth } from '../../hooks/useAuth';
import { VIEWPORT_WIDTH } from '../../constants';

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
    backgroundColor: '#1A1A2E',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    fontFamily: '"Space Mono", monospace',
  },
  title: {
    fontSize: 24,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8B8B',
    marginBottom: 32,
  },
  text: {
    fontSize: 14,
    color: '#8B8B8B',
  },
  error: {
    fontSize: 14,
    color: '#E07A5F',
    maxWidth: 300,
    textAlign: 'center',
  },
  button: {
    padding: '12px 24px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: '#4ECDC4',
    color: '#1A1A2E',
    border: 'none',
    cursor: 'pointer',
  },
};
