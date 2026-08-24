import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase.js';
import { api } from '../services/api.js';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isConfigured: false,
  error: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  signOutUser: async () => {},
  refreshProfile: async () => {},
  clearError: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(async () => {
    if (!auth?.currentUser) return null;
    try {
      const profileData = await api.getProfile();
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch Neon profile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Synchronize with Neon backend
          const syncedProfile = await api.syncAuthUser();
          setProfile(syncedProfile);
        } catch (syncErr) {
          console.warn('[AuthContext] User sync with Neon database notice:', syncErr.message);
          setProfile({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            photo_url: firebaseUser.photoURL
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase is not configured. Please add your credentials in .env');
    }
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      setUser(firebaseUser);
      try {
        const syncedProfile = await api.syncAuthUser();
        setProfile(syncedProfile);
      } catch (e) {
        console.warn('[AuthContext] Background sync warning:', e);
      }
      return firebaseUser;
    } catch (err) {
      let message = 'Failed to sign in with Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign in was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured.');
    }
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = result.user;
      setUser(firebaseUser);
      try {
        const syncedProfile = await api.syncAuthUser();
        setProfile(syncedProfile);
      } catch (e) {
        console.warn('[AuthContext] Background sync warning:', e);
      }
      return firebaseUser;
    } catch (err) {
      let message = 'Failed to sign in with email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later or reset your password.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured.');
    }
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = result.user;
      if (displayName && displayName.trim()) {
        await updateProfile(firebaseUser, { displayName: displayName.trim() });
      }
      setUser(firebaseUser);
      try {
        const syncedProfile = await api.syncAuthUser();
        setProfile(syncedProfile);
      } catch (e) {
        console.warn('[AuthContext] Background sync warning:', e);
      }
      return firebaseUser;
    } catch (err) {
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please meet all password requirements.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (email) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured.');
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err) {
      let message = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const updateUserProfile = async ({ displayName, photoURL }) => {
    setError(null);
    if (!auth?.currentUser) {
      throw new Error('Not authenticated.');
    }
    try {
      if (displayName !== undefined || photoURL !== undefined) {
        await updateProfile(auth.currentUser, {
          ...(displayName !== undefined ? { displayName: displayName.trim() } : {}),
          ...(photoURL !== undefined ? { photoURL } : {})
        });
      }

      // Persist to Neon
      const updatedNeon = await api.updateProfile({
        display_name: displayName?.trim() || auth.currentUser.displayName,
        photo_url: photoURL || auth.currentUser.photoURL
      });

      setProfile(updatedNeon);
      setUser({ ...auth.currentUser });
      return updatedNeon;
    } catch (err) {
      console.error('[AuthContext] Update profile error:', err);
      const msg = err.message || 'Failed to update profile.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('[AuthContext] Sign out warning:', err);
    } finally {
      setUser(null);
      setProfile(null);
      try {
        sessionStorage.clear();
      } catch (e) {
        // ignore
      }
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isFirebaseConfigured,
        error,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updateUserProfile,
        signOutUser,
        refreshProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
