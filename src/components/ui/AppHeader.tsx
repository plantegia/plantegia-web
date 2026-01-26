import { LogIn, LogOut } from 'lucide-react';
import { COLORS, BASE_URL } from '../../constants';

interface AppHeaderProps {
  onAction: () => void;
  actionType: 'login' | 'logout';
}

export function AppHeader({ onAction, actionType }: AppHeaderProps) {
  const Icon = actionType === 'login' ? LogIn : LogOut;
  const title = actionType === 'login' ? 'Sign in' : 'Sign out';

  return (
    <div style={styles.header}>
      <div style={styles.logo}>
        <img
          src={`${BASE_URL}icons/plantegia_icon.svg`}
          alt=""
          style={styles.logoIcon}
        />
        <span style={styles.logoText}>PLANTEGIA</span>
      </div>
      <button
        className="btn-secondary"
        style={styles.actionButton}
        onClick={onAction}
        title={title}
      >
        <Icon size={18} />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.textMuted,
    backgroundColor: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
};
