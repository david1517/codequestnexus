import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User, UserRole } from '@/types';

interface TeacherApplicationData {
  name: string;
  phone: string;
  birthDate: string;
  knowledgeArea: string;
  document: File | null;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  teacherApplication?: TeacherApplicationData;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    data: RegisterData
  ) => Promise<void>;

  loginWithGoogle: () => Promise<void>;

  logout: () => void;

  initAuth: () => void;
}

const HAS_FIREBASE =
  Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

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
    'auth/email-already-in-use':
      'Este email já está cadastrado.',

    'auth/invalid-email':
      'O email informado é inválido.',

    'auth/weak-password':
      'A senha é muito fraca.',

    'auth/user-not-found':
      'Usuário não encontrado.',

    'auth/wrong-password':
      'Senha incorreta.',

    'auth/invalid-credential':
      'Email ou senha incorretos.',

    'auth/popup-closed-by-user':
      'Login cancelado.',

    'auth/network-request-failed':
      'Erro de conexão com a internet.',

    'auth/too-many-requests':
      'Muitas tentativas. Aguarde um pouco.',
  };

  return erros[code || ''] || 'Erro ao autenticar.';
}

function criarUsuario(
  id: string,
  username: string,
  email: string,
  role: UserRole
): User {
  return {
    id,
    username,
    email,
    avatarUrl: '',
    role,
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    className: 'Initiate',
    title:
      role === 'teacher'
        ? 'Professor'
        : role === 'admin'
          ? 'Administrador'
          : 'Iniciante',
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
        set({
          initialized: true,
        });
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

            const {
              auth,
              db,
            } = await import('@/lib/firebase');

            if (!auth || !db) {
              throw new Error(
                'Firebase não está configurado corretamente.'
              );
            }

            const result =
              await signInWithEmailAndPassword(
                auth,
                email,
                password
              );

            const userRef = doc(
              db,
              'users',
              result.user.uid
            );

            const userSnap =
              await getDoc(userRef);

            let user: User;

            if (userSnap.exists()) {
              const data =
                userSnap.data();

              user = {
                id: result.user.uid,

                username:
                  data.username ||
                  result.user.displayName ||
                  email.split('@')[0],

                email:
                  data.email || email,

                avatarUrl:
                  data.avatarUrl ||
                  result.user.photoURL ||
                  '',

                role:
                  data.role || 'student',

                level:
                  data.level || 1,

                xp:
                  data.xp || 0,

                currentStreak:
                  data.currentStreak || 0,

                longestStreak:
                  data.longestStreak || 0,

                className:
                  data.className ||
                  'Initiate',

                title:
                  data.title ||
                  'Iniciante',

                joinedAt:
                  data.joinedAt ||
                  new Date().toISOString(),
              };
            } else {
              user = criarUsuario(
                result.user.uid,
                email.split('@')[0],
                email,
                'student'
              );

              await setDoc(
                userRef,
                {
                  ...user,
                  createdAt:
                    serverTimestamp(),
                }
              );
            }

            set({
              user,
              loading: false,
              error: null,
            });

            return;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          set({
            user: {
              ...MOCK_USER,
              email,
            },
            loading: false,
            error: null,
          });
        } catch (err: unknown) {
          const error = err as {
            code?: string;
            message?: string;
          };

          const message =
            error.code
              ? traduzErro(error.code)
              : error.message ||
                'Erro ao autenticar.';

          set({
            error: message,
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
          /*
           * ADMIN NÃO PODE SER CRIADO
           * PELO CADASTRO PÚBLICO.
           */
          if (data.role === 'admin') {
            throw new Error(
              'Uma conta de administrador não pode ser criada pelo cadastro público.'
            );
          }

          if (HAS_FIREBASE) {
            const {
              createUserWithEmailAndPassword,
              updateProfile,
            } = await import('firebase/auth');

            const {
              doc,
              setDoc,
              serverTimestamp,
            } = await import(
              'firebase/firestore'
            );

            const {
              auth,
              db,
            } = await import('@/lib/firebase');

            if (!auth || !db) {
              throw new Error(
                'Firebase não está configurado corretamente.'
              );
            }

            /*
             * CRIA A CONTA NO FIREBASE AUTH
             */
            const result =
              await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
              );

            /*
             * DEFINE O NOME DO USUÁRIO
             */
            await updateProfile(
              result.user,
              {
                displayName:
                  data.username,
              }
            );

            /*
             * CRIA O OBJETO BASE DO USUÁRIO
             */
            const user = criarUsuario(
              result.user.uid,
              data.username,
              data.email,
              data.role
            );

            /*
             * DADOS DA COLEÇÃO USERS
             */
            const firebaseUserData: Record<
              string,
              unknown
            > = {
              ...user,

              role: data.role,

              createdAt:
                serverTimestamp(),
            };

            /*
             * =========================================
             * PROFESSOR
             * =========================================
             *
             * O usuário continua sendo criado em:
             *
             * users/{uid}
             *
             * E agora também será criado em:
             *
             * teachers/{uid}
             */
            if (
              data.role === 'teacher'
            ) {
              /*
               * Mantemos essas informações em users
               * por compatibilidade com o sistema atual.
               */
              firebaseUserData.teacherStatus =
                'pending';

              /*
               * Se houver formulário de professor,
               * criamos o documento na coleção teachers.
               */
              if (
                data.teacherApplication
              ) {
                const teacher =
                  data.teacherApplication;

                /*
                 * DADOS DO PROFESSOR
                 */
                const teacherData: Record<
                  string,
                  unknown
                > = {
                  userId:
                    result.user.uid,

                  name:
                    teacher.name,

                  phone:
                    teacher.phone,

                  birthDate:
                    teacher.birthDate,

                  knowledgeArea:
                    teacher.knowledgeArea,

                  status:
                    'pending',

                  documentName:
                    teacher.document?.name ||
                    '',

                  createdAt:
                    serverTimestamp(),

                  updatedAt:
                    serverTimestamp(),
                };

                /*
                 * CRIA:
                 *
                 * teachers/{UID_DO_PROFESSOR}
                 */
                await setDoc(
                  doc(
                    db,
                    'teachers',
                    result.user.uid
                  ),
                  teacherData
                );

                /*
                 * Também mantemos uma cópia
                 * resumida da candidatura em users
                 * por enquanto, para não quebrar
                 * nenhuma parte existente.
                 */
                firebaseUserData.teacherApplication =
                  {
                    name:
                      teacher.name,

                    phone:
                      teacher.phone,

                    birthDate:
                      teacher.birthDate,

                    knowledgeArea:
                      teacher.knowledgeArea,

                    documentName:
                      teacher.document?.name ||
                      '',
                  };

                firebaseUserData.teacherApplicationSubmittedAt =
                  serverTimestamp();
              }
            }

            /*
             * =========================================
             * SALVA O USUÁRIO
             * =========================================
             */
            await setDoc(
              doc(
                db,
                'users',
                result.user.uid
              ),
              firebaseUserData
            );

            set({
              user,
              loading: false,
              error: null,
            });

            return;
          }

          /*
           * =========================================
           * MODO LOCAL
           * =========================================
           */
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          const user = criarUsuario(
            `local-${Date.now()}`,
            data.username,
            data.email,
            data.role
          );

          set({
            user,
            loading: false,
            error: null,
          });
        } catch (err: unknown) {
          const error = err as {
            code?: string;
            message?: string;
          };

          const message =
            error.code
              ? traduzErro(error.code)
              : error.message ||
                'Não foi possível criar a conta.';

          set({
            error: message,
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
              doc,
              getDoc,
              setDoc,
              serverTimestamp,
            } = await import(
              'firebase/firestore'
            );

            const {
              auth,
              db,
            } = await import('@/lib/firebase');

            if (!auth || !db) {
              throw new Error(
                'Firebase não está configurado corretamente.'
              );
            }

            const provider =
              new GoogleAuthProvider();

            const result =
              await signInWithPopup(
                auth,
                provider
              );

            const userRef = doc(
              db,
              'users',
              result.user.uid
            );

            const userSnap =
              await getDoc(userRef);

            let user: User;

            if (userSnap.exists()) {
              const data =
                userSnap.data();

              user = {
                id: result.user.uid,

                username:
                  data.username ||
                  result.user.displayName ||
                  'Coder',

                email:
                  data.email ||
                  result.user.email ||
                  '',

                avatarUrl:
                  data.avatarUrl ||
                  result.user.photoURL ||
                  '',

                role:
                  data.role || 'student',

                level:
                  data.level || 1,

                xp:
                  data.xp || 0,

                currentStreak:
                  data.currentStreak || 0,

                longestStreak:
                  data.longestStreak || 0,

                className:
                  data.className ||
                  'Initiate',

                title:
                  data.title ||
                  'Iniciante',

                joinedAt:
                  data.joinedAt ||
                  new Date().toISOString(),
              };
            } else {
              user = criarUsuario(
                result.user.uid,
                result.user.displayName ||
                  'Coder',
                result.user.email ||
                  '',
                'student'
              );

              user.avatarUrl =
                result.user.photoURL || '';

              await setDoc(
                userRef,
                {
                  ...user,
                  createdAt:
                    serverTimestamp(),
                }
              );
            }

            set({
              user,
              loading: false,
              error: null,
            });

            return;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          set({
            user: MOCK_USER,
            loading: false,
            error: null,
          });
        } catch (err: unknown) {
          const error = err as {
            code?: string;
            message?: string;
          };

          const message =
            error.code
              ? traduzErro(error.code)
              : error.message ||
                'Erro ao entrar com Google.';

          set({
            error: message,
            loading: false,
          });

          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          error: null,
          loading: false,
        });
      },
    }),

    {
      name: 'codequest-auth',

      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);