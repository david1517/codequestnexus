import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

const HAS_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

const MOCK_USER: User = {
  id: 'demo-user-001',
  username: 'DemoCoder',
  email: 'demo@nexus.io',
  avatarUrl: '',
  level: 1,
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  className: 'Initiate',
  title: 'Iniciante',
  joinedAt: new Date().toISOString(),
};

function traduzErro(code?: string): string {
  const erros: Record<string, string> = {
    'auth/email-already-in-use': 'Este email ja esta cadastrado',
    'auth/invalid-email': 'Email invalido',
    'auth/weak-password': 'Senha muito fraca',
    'auth/user-not-found': 'Usuario nao encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-credential': 'Email ou senha incorretos',
    'auth/popup-closed-by-user': 'Login cancelado',
  };
  return erros[code || ''] || 'Erro ao autenticar';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      initialized: false,
      error: null,

      initAuth: () => {
        set({ initialized: true });
      },

      login: async (email, _password) => {
        set({ loading: true, error: null });
        try {
          if (HAS_FIREBASE) {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const { auth, db } = await import('@/lib/firebase');

            const result = await signInWithEmailAndPassword(auth, email, _password);
            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            let user: User;
            if (userSnap.exists()) {
              user = userSnap.data() as User;
            } else {
              user = {
                id: result.user.uid,
                username: email.split('@')[0],
                email,
                avatarUrl: '',
                level: 1, xp: 0, currentStreak: 0, longestStreak: 0,
                className: 'Initiate', title: 'Iniciante',
                joinedAt: new Date().toISOString(),
              };
              await setDoc(userRef, { ...user, createdAt: serverTimestamp() });
            }
            set({ user, loading: false });
          } else {
            await new Promise((r) => setTimeout(r, 500));
            set({ user: { ...MOCK_USER, email }, loading: false });
          }
        } catch (err: any) {
          set({ error: traduzErro(err?.code), loading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          if (HAS_FIREBASE) {
            const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const { auth, db } = await import('@/lib/firebase');

            const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfile(result.user, { displayName: data.username });

            const user: User = {
              id: result.user.uid,
              username: data.username,
              email: data.email,
              avatarUrl: '',
              level: 1, xp: 0, currentStreak: 0, longestStreak: 0,
              className: 'Initiate', title: 'Iniciante',
              joinedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', result.user.uid), { ...user, createdAt: serverTimestamp() });
            set({ user, loading: false });
          } else {
            await new Promise((r) => setTimeout(r, 500));
            set({ user: { ...MOCK_USER, username: data.username, email: data.email }, loading: false });
          }
        } catch (err: any) {
          set({ error: traduzErro(err?.code), loading: false });
          throw err;
        }
      },

      loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          if (HAS_FIREBASE) {
            const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const { auth, db } = await import('@/lib/firebase');

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            let user: User;
            if (userSnap.exists()) {
              user = userSnap.data() as User;
            } else {
              user = {
                id: result.user.uid,
                username: result.user.displayName || 'Coder',
                email: result.user.email || '',
                avatarUrl: result.user.photoURL || '',
                level: 1, xp: 0, currentStreak: 0, longestStreak: 0,
                className: 'Initiate', title: 'Iniciante',
                joinedAt: new Date().toISOString(),
              };
              await setDoc(userRef, { ...user, createdAt: serverTimestamp() });
            }
            set({ user, loading: false });
          } else {
            await new Promise((r) => setTimeout(r, 500));
            set({ user: MOCK_USER, loading: false });
          }
        } catch (err: any) {
          set({ error: traduzErro(err?.code), loading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },
    }),
    { name: 'codequest-auth' }
  )
);
