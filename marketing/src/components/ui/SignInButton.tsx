import { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

interface SignInButtonProps {
  className?: string;
  label?: string;
  labelSignedIn?: string;
}

export function SignInButton({
  className = '',
  label = 'Sign in with Google',
  labelSignedIn = 'Go to App'
}: SignInButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      // Redirect to app after successful sign in
      window.location.href = '/p/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const handleGoToApp = () => {
    window.location.href = '/p/';
  };

  if (loading) {
    return (
      <button className={className} disabled>
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <button className={className} onClick={handleGoToApp}>
        {labelSignedIn}
      </button>
    );
  }

  return (
    <>
      <button className={className} onClick={handleSignIn}>
        {label}
      </button>
      {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
    </>
  );
}
