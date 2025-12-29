import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, loading: false, error: null });
      },
      (error) => {
        setState({ user: null, loading: false, error: error.message });
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setState((s) => ({
        ...s,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setState((s) => ({
        ...s,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signInWithGoogle,
    signOut,
  };
}
