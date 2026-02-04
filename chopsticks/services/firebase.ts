import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Gracefully handle missing native module (e.g. Expo Go)
let _auth: any = null;
export let isFirebaseMocked = false;

try {
  const mod = require('@react-native-firebase/auth');
  _auth = mod.default;
  _auth(); // probe — throws if native module is missing
} catch {
  isFirebaseMocked = true;
  console.warn('[Firebase] Native module unavailable. Running in mock mode (Expo Go).');
}

export interface FirebaseAuthService {
  signInWithPhoneNumber: (phoneNumber: string) => Promise<FirebaseAuthTypes.ConfirmationResult>;
  confirmCode: (confirmation: FirebaseAuthTypes.ConfirmationResult, code: string) => Promise<FirebaseAuthTypes.UserCredential>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  signOut: () => Promise<void>;
  getCurrentUser: () => FirebaseAuthTypes.User | null;
  onAuthStateChanged: (callback: (user: FirebaseAuthTypes.User | null) => void) => () => void;
}

class FirebaseAuth implements FirebaseAuthService {
  async signInWithPhoneNumber(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
    if (isFirebaseMocked) {
      return { confirm: async () => ({} as FirebaseAuthTypes.UserCredential) } as any;
    }
    const confirmation = await _auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  }

  async confirmCode(
    confirmation: FirebaseAuthTypes.ConfirmationResult,
    code: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    if (isFirebaseMocked) {
      return {} as FirebaseAuthTypes.UserCredential;
    }
    const credential = await confirmation.confirm(code);
    if (!credential) {
      throw new Error('OTP confirmation returned no credential');
    }
    return credential;
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (isFirebaseMocked) return 'mock-firebase-token';
    const user = _auth().currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  }

  async signOut(): Promise<void> {
    if (isFirebaseMocked) return;
    await _auth().signOut();
  }

  getCurrentUser(): FirebaseAuthTypes.User | null {
    if (isFirebaseMocked) return null;
    return _auth().currentUser;
  }

  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void): () => void {
    if (isFirebaseMocked) return () => {};
    return _auth().onAuthStateChanged(callback);
  }
}

export const firebaseAuth = new FirebaseAuth();
