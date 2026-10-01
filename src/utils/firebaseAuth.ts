import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider configured specifically for YouTube Upload
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube.upload');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory cache for OAuth access token (NEVER store in localStorage or sessionStorage)
let inMemoryAccessToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (inMemoryAccessToken) {
        onAuthSuccess?.(user, inMemoryAccessToken);
      } else if (!isSigningIn) {
        // User logged in, but token might need a quick popup or refresh
        onAuthSuccess?.(user, null);
      }
    } else {
      inMemoryAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const signInWithGoogleYouTube = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Could not retrieve YouTube OAuth access token.');
    }

    inMemoryAccessToken = credential.accessToken;
    return {
      user: result.user,
      accessToken: inMemoryAccessToken,
    };
  } catch (err: any) {
    console.error('Google YouTube Sign-in error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const logoutYouTube = async (): Promise<void> => {
  await signOut(auth);
  inMemoryAccessToken = null;
};
