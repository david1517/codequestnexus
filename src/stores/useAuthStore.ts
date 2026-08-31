import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;

  loginWithGoogle: () => Promise<void>;

  logout: () => Promise<void>;

  initAuth: () => void;
}

/*
 * Verifica se o Firebase está configurado
 * através da variável do .env
 */
const HAS_FIREBASE =
  !!import.meta.env.VITE_FIREBASE_API_KEY;

/*
 * Usuário utilizado quando o projeto está
 * funcionando em modo local.
 */
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

/*
 * Traduz os códigos de erro do Firebase
 * para mensagens em português.
 */
function traduzErro(code?: string): string {
  const erros: Record<string, string> = {
    'auth/email-already-in-use':
      'Este email já está cadastrado.',

    'auth/invalid-email':
      'Email inválido.',

    'auth/weak-password':
      'A senha precisa ter pelo menos 6 caracteres.',

    'auth/user-not-found':
      'Usuário não encontrado.',

    'auth/wrong-password':
      'Senha incorreta.',

    'auth/invalid-credential':
      'Email ou senha incorretos.',

    'auth/popup-closed-by-user':
      'Login cancelado.',

    'auth/network-request-failed':
      'Erro de conexão com o Firebase.',

    'auth/too-many-requests':
      'Muitas tentativas. Tente novamente mais tarde.',

    'auth/user-disabled':
      'Esta conta foi desativada.',

    'PERMISSION_DENIED':
      'Permissão negada no Realtime Database. Verifique as Rules.',

    'permission-denied':
      'Permissão negada no Realtime Database. Verifique as Rules.',
  };

  return (
    erros[code || ''] ||
    'Erro ao autenticar. Tente novamente.'
  );
}

/*
 * Store principal de autenticação.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      loading: false,

      initialized: false,

      error: null,

      /*
       * Inicializa o estado de autenticação.
       */
      initAuth: () => {
        set({
          initialized: true,
        });
      },

      /*
       * LOGIN COM EMAIL E SENHA
       */
      login: async (email, password) => {
        set({
          loading: true,
          error: null,
        });

        try {
          /*
           * ==========================
           * FIREBASE
           * ==========================
           */
          if (HAS_FIREBASE) {
            const {
              signInWithEmailAndPassword,
            } = await import('firebase/auth');

            const {
              ref,
              get,
              set: setDatabase,
            } = await import('firebase/database');

            const {
              auth,
              db,
            } = await import('@/lib/firebase');

            /*
             * O ! informa ao TypeScript que,
             * nesse ponto, o Firebase deve existir.
             */
            const result =
              await signInWithEmailAndPassword(
                auth!,
                email.trim(),
                password
              );

            /*
             * Caminho do usuário no Realtime Database:
             *
             * users/UID
             */
            const userRef = ref(
              db!,
              'users/' + result.user.uid
            );

            const userSnap = await get(
              userRef
            );

            let user: User;

            /*
             * Se o usuário já possui dados no
             * Realtime Database, carregamos eles.
             */
            if (userSnap.exists()) {
              user =
                userSnap.val() as User;
            } else {
              /*
               * Caso a conta exista no Authentication,
               * mas ainda não exista no Database,
               * criamos os dados automaticamente.
               */
              user = {
                id: result.user.uid,

                username:
                  result.user.displayName ||
                  email.split('@')[0],

                email:
                  result.user.email ||
                  email,

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
              error: null,
            });
          } else {
            /*
             * ==========================
             * MODO LOCAL
             * ==========================
             */
            await new Promise((resolve) =>
              setTimeout(resolve, 500)
            );

            set({
              user: {
                ...MOCK_USER,
                email: email.trim(),
              },

              loading: false,

              initialized: true,

              error: null,
            });
          }
        } catch (err: any) {
          console.error(
            '❌ Erro no login:',
            err
          );

          const message =
            traduzErro(err?.code);

          set({
            error: message,
            loading: false,
          });

          throw err;
        }
      },

      /*
       * ==========================
       * REGISTRO
       * ==========================
       */
      register: async (data) => {
        set({
          loading: true,
          error: null,
        });

        try {
          /*
           * ==========================
           * FIREBASE
           * ==========================
           */
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

            const {
              auth,
              db,
            } = await import('@/lib/firebase');

            /*
             * Cria a conta no Firebase Authentication.
             */
            const result =
              await createUserWithEmailAndPassword(
                auth!,
                data.email.trim(),
                data.password
              );

            /*
             * Define o nome do usuário
             * no Firebase Authentication.
             */
            await updateProfile(
              result.user,
              {
                displayName:
                  data.username.trim(),
              }
            );

            /*
             * Dados do usuário que serão
             * armazenados no Realtime Database.
             */
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

            /*
             * Caminho onde o usuário será salvo:
             *
             * users/UID
             */
            const userRef = ref(
              db!,
              'users/' + result.user.uid
            );

            /*
             * Salva o usuário no
             * Firebase Realtime Database.
             */
            await setDatabase(
              userRef,
              user
            );

            console.log(
              '✅ Usuário criado no Firebase!'
            );

            console.log(
              '📁 Caminho: users/' +
                result.user.uid
            );

            set({
              user,

              loading: false,

              initialized: true,

              error: null,
            });
          } else {
            /*
             * ==========================
             * MODO LOCAL
             * ==========================
             */
            await new Promise((resolve) =>
              setTimeout(resolve, 500)
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

              error: null,
            });
          }
        } catch (err: any) {
          console.error(
            '❌ Erro ao criar conta:',
            err
          );

          const message =
            traduzErro(err?.code);

          set({
            error: message,
            loading: false,
          });

          throw err;
        }
      },

      /*
       * ==========================
       * LOGIN COM GOOGLE
       * ==========================
       */
      loginWithGoogle: async () => {
        set({
          loading: true,
          error: null,
        });

        try {
          /*
           * ==========================
           * FIREBASE
           * ==========================
           */
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

            const {
              auth,
              db,
            } = await import('@/lib/firebase');

            const provider =
              new GoogleAuthProvider();

            /*
             * Abre o login do Google.
             */
            const result =
              await signInWithPopup(
                auth!,
                provider
              );

            /*
             * Procura os dados do usuário
             * no Realtime Database.
             */
            const userRef = ref(
              db!,
              'users/' + result.user.uid
            );

            const userSnap = await get(
              userRef
            );

            let user: User;

            /*
             * Usuário já existe no Database.
             */
            if (userSnap.exists()) {
              user =
                userSnap.val() as User;
            } else {
              /*
               * Primeiro login com Google.
               *
               * Criamos o usuário no Database.
               */
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

              console.log(
                '✅ Usuário Google salvo no Firebase!'
              );
            }

            set({
              user,

              loading: false,

              initialized: true,

              error: null,
            });
          } else {
            /*
             * ==========================
             * MODO LOCAL
             * ==========================
             */
            await new Promise((resolve) =>
              setTimeout(resolve, 500)
            );

            set({
              user: MOCK_USER,

              loading: false,

              initialized: true,

              error: null,
            });
          }
        } catch (err: any) {
          console.error(
            '❌ Erro no login com Google:',
            err
          );

          const message =
            traduzErro(err?.code);

          set({
            error: message,
            loading: false,
          });

          throw err;
        }
      },

      /*
       * ==========================
       * LOGOUT
       * ==========================
       */
      logout: async () => {
        try {
          if (HAS_FIREBASE) {
            const {
              signOut,
            } = await import(
              'firebase/auth'
            );

            const {
              auth,
            } = await import(
              '@/lib/firebase'
            );

            await signOut(auth!);
          }

          set({
            user: null,
            error: null,
          });

          console.log(
            '✅ Logout realizado.'
          );
        } catch (err) {
          console.error(
            '❌ Erro ao fazer logout:',
            err
          );

          /*
           * Mesmo se houver erro no Firebase,
           * removemos o usuário localmente.
           */
          set({
            user: null,
            error: null,
          });
        }
      },
    }),

    /*
     * Persiste o usuário no navegador.
     */
    {
      name: 'codequest-auth',
    }
  )
);