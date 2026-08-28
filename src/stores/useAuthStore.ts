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
  logout: () => Promise<void>;
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
    'auth/email-already-in-use': 'Este email já está cadastrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'Senha muito fraca',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-credential': 'Email ou senha incorretos',
    'auth/popup-closed-by-user': 'Login cancelado',
    'auth/network-request-failed': 'Erro de conexão',
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

      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          if (HAS_FIREBASE) {
            const { signInWithEmailAndPassword } =
              await import('firebase/auth');

            const { ref, get, set: setDatabase } =
              await import('firebase/database');

            const { auth, db } =
              await import('@/lib/firebase');

            const result =
              await signInWithEmailAndPassword(
                auth,
                email,
                password
              );

            const userRef = ref(
              db,
              'users/' + result.user.uid
            );

            const userSnap = await get(userRef);

            let user: User;

            if (userSnap.exists()) {
              user = userSnap.val() as User;
            } else {
              user = {
                id: result.user.uid,
                username:
                  result.user.displayName ||
                  email.split('@')[0],
                email:
                  result.user.email || email,
                avatarUrl:
                  result.user.photoURL || '',
                level: 1,
                xp: 0,
                currentStreak: 0,
                longestStreak: 0,
                className: 'Initiate',
                title: 'Iniciante',
                joinedAt:
                  new Date().toISOString(),
              };

              await setDatabase(
                userRef,
                user
              );
            }

            set({
              user,
              loading: false,
              initialized: true,
            });
          } else {
            await new Promise((r) =>
              setTimeout(r, 500)
            );

            set({
              user: {
                ...MOCK_USER,
                email,
              },
              loading: false,
              initialized: true,
            });
          }
        } catch (err: any) {
          console.error(
            'Erro no login:',
            err
          );

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
            } = await import(
              'firebase/auth'
            );

            const {
              ref,
              set: setDatabase,
            } = await import(
              'firebase/database'
            );

            const { auth, db } =
              await import('@/lib/firebase');

            const result =
              await createUserWithEmailAndPassword(
                auth,
                data.email.trim(),
                data.password
              );

            await updateProfile(
              result.user,
              {
                displayName:
                  data.username.trim(),
              }
            );

            const user: User = {
              id: result.user.uid,
              username:
                data.username.trim(),
              email:
                data.email.trim(),
              avatarUrl: '',
              level: 1,
              xp: 0,
              currentStreak: 0,
              longestStreak: 0,
              className: 'Initiate',
              title: 'Iniciante',
              joinedAt:
                new Date().toISOString(),
            };

            const userRef = ref(
              db,
              'users/' + result.user.uid
            );

            await setDatabase(
              userRef,
              user
            );

            set({
              user,
              loading: false,
              initialized: true,
            });
          } else {
            await new Promise((r) =>
              setTimeout(r, 500)
            );

            set({
              user: {
                ...MOCK_USER,
                username:
                  data.username,
                email:
                  data.email,
              },
              loading: false,
              initialized: true,
            });
          }
        } catch (err: any) {
          console.error(
            'Erro no registro:',
            err
          );

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
            } = await import(
              'firebase/auth'
            );

            const {
              ref,
              get,
              set: setDatabase,
            } = await import(
              'firebase/database'
            );

            const { auth, db } =
              await import('@/lib/firebase');

            const provider =
              new GoogleAuthProvider();

            const result =
              await signInWithPopup(
                auth,
                provider
              );

            const userRef = ref(
              db,
              'users/' + result.user.uid
            );

            const userSnap =
              await get(userRef);

            let user: User;

            if (userSnap.exists()) {
              user =
                userSnap.val() as User;
            } else {
              user = {
                id: result.user.uid,
                username:
                  result.user.displayName ||
                  'Coder',
                email:
                  result.user.email || '',
                avatarUrl:
                  result.user.photoURL || '',
                level: 1,
                xp: 0,
                currentStreak: 0,
                longestStreak: 0,
                className: 'Initiate',
                title: 'Iniciante',
                joinedAt:
                  new Date().toISOString(),
              };

              await setDatabase(
                userRef,
                user
              );
            }

            set({
              user,
              loading: false,
              initialized: true,
            });
          } else {
            await new Promise((r) =>
              setTimeout(r, 500)
            );

            set({
              user: MOCK_USER,
              loading: false,
              initialized: true,
            });
          }
        } catch (err: any) {
          console.error(
            'Erro no login com Google:',
            err
          );

          set({
            error: traduzErro(err?.code),
            loading: false,
          });

          throw err;
        }
      },

      logout: async () => {
        try {
          if (HAS_FIREBASE) {
            const { signOut } =
              await import(
                'firebase/auth'
              );

            const { auth } =
              await import(
                '@/lib/firebase'
              );

            await signOut(auth);
          }

          set({
            user: null,
            error: null,
          });
        } catch (err) {
          console.error(
            'Erro ao fazer logout:',
            err
          );

          set({
            user: null,
            error: null,
          });
        }
      },
    }),

    {
      name: 'codequest-auth',
    }
  )
);