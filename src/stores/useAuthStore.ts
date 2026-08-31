import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
  role: 'student',
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
    'auth/email-already-in-use': 'Este email já está cadastrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'Senha muito fraca',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-credential': 'Email ou senha incorretos',
    'auth/popup-closed-by-user': 'Login cancelado',
  };

  return erros[code || ''] || 'Erro ao autenticar';
}

function criarUsuario(
  id: string,
  username: string,
  email: string,
  role: UserRole,
  avatarUrl = ''
): User {
  return {
    id,
    username,
    email,
    avatarUrl,
    role,
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    className: 'Initiate',
    title: 'Iniciante',
    joinedAt: new Date().toISOString(),
  };
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

      login: async (email, password) => {
        set({
          loading: true,
          error: null,
        });

        try {
          if (HAS_FIREBASE) {
            const {
              signInWithEmailAndPassword,
            } = await import('firebase/auth');

            const {
              doc,
              getDoc,
              setDoc,
              serverTimestamp,
            } = await import('firebase/firestore');

            const { auth, db } = await import('@/lib/firebase');

            const result = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            let user: User;

            if (userSnap.exists()) {
              const data = userSnap.data();

              user = {
                ...criarUsuario(
                  result.user.uid,
                  data.username || email.split('@')[0],
                  data.email || email,
                  data.role || 'student',
                  data.avatarUrl || ''
                ),
                ...data,
              } as User;
            } else {
              user = criarUsuario(
                result.user.uid,
                email.split('@')[0],
                email,
                'student'
              );

              await setDoc(userRef, {
                ...user,
                createdAt: serverTimestamp(),
              });
            }

            set({
              user,
              loading: false,
            });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500));

            set({
              user: {
                ...MOCK_USER,
                email,
              },
              loading: false,
            });
          }
        } catch (err: any) {
          set({
            error: traduzErro(err?.code),
            loading: false,
          });

          throw err;
        }
      },

      register: async (data) => {
        set({
          loading: true,
          error: null,
        });

        try {
          if (HAS_FIREBASE) {
            const {
              createUserWithEmailAndPassword,
              updateProfile,
            } = await import('firebase/auth');

            const {
              doc,
              setDoc,
              serverTimestamp,
            } = await import('firebase/firestore');

            const { auth, db } = await import('@/lib/firebase');

            const result = await createUserWithEmailAndPassword(
              auth,
              data.email,
              data.password
            );

            await updateProfile(result.user, {
              displayName: data.username,
            });

            const user = criarUsuario(
              result.user.uid,
              data.username,
              data.email,
              data.role
            );

            await setDoc(doc(db, 'users', result.user.uid), {
              ...user,
              createdAt: serverTimestamp(),
            });

            set({
              user,
              loading: false,
            });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const user = criarUsuario(
              `local-${Date.now()}`,
              data.username,
              data.email,
              data.role
            );

            set({
              user,
              loading: false,
            });
          }
        } catch (err: any) {
          set({
            error: traduzErro(err?.code),
            loading: false,
          });

          throw err;
        }
      },

      loginWithGoogle: async () => {
        set({
          loading: true,
          error: null,
        });

        try {
          if (HAS_FIREBASE) {
            const {
              signInWithPopup,
              GoogleAuthProvider,
            } = await import('firebase/auth');

            const {
              doc,
              getDoc,
              setDoc,
              serverTimestamp,
            } = await import('firebase/firestore');

            const { auth, db } = await import('@/lib/firebase');

            const provider = new GoogleAuthProvider();

            const result = await signInWithPopup(
              auth,
              provider
            );

            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            let user: User;

            if (userSnap.exists()) {
              const data = userSnap.data();

              user = {
                ...criarUsuario(
                  result.user.uid,
                  data.username ||
                    result.user.displayName ||
                    'Coder',
                  data.email ||
                    result.user.email ||
                    '',
                  data.role || 'student',
                  data.avatarUrl ||
                    result.user.photoURL ||
                    ''
                ),
                ...data,
              } as User;
            } else {
              user = criarUsuario(
                result.user.uid,
                result.user.displayName || 'Coder',
                result.user.email || '',
                'student',
                result.user.photoURL || ''
              );

              await setDoc(userRef, {
                ...user,
                createdAt: serverTimestamp(),
              });
            }

            set({
              user,
              loading: false,
            });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500));

            set({
              user: MOCK_USER,
              loading: false,
            });
          }
        } catch (err: any) {
          set({
            error: traduzErro(err?.code),
            loading: false,
          });

          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          error: null,
        });
      },
    }),
    {
      name: 'codequest-auth',
    }
  )
);