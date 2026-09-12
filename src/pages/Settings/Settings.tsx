import {
  useEffect,
  useState,
} from 'react';

import type {
  CSSProperties,
  ReactNode,
} from 'react';

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/useAuthStore';

interface Course {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface UserRating {
  rating: number;
  comment: string;
}

interface CourseRatingSummary {
  average: number;
  count: number;
}

type Section =
  | 'appearance'
  | 'notifications'
  | 'sound'
  | 'preferences'
  | 'ratings'
  | 'account';

const SETTINGS_STORAGE_KEY =
  'codequest-settings';

interface SettingsData {
  theme:
    | 'dark'
    | 'light'
    | 'system';

  interfaceSize:
    | 'small'
    | 'normal'
    | 'large';

  notifications: {
    missions: boolean;
    achievements: boolean;
    newLessons: boolean;
  };

  sound: {
    interface: boolean;
    achievements: boolean;
  };

  language:
    | 'pt-BR'
    | 'en';
}

const defaultSettings: SettingsData = {
  theme: 'dark',

  interfaceSize:
    'normal',

  notifications: {
    missions: true,
    achievements: true,
    newLessons: true,
  },

  sound: {
    interface: true,
    achievements: true,
  },

  language: 'pt-BR',
};

function getSettingsKey(
  userId: string
) {
  return `${SETTINGS_STORAGE_KEY}-${userId}`;
}

function loadSettings(
  userId: string
): SettingsData {
  try {
    const stored =
      localStorage.getItem(
        getSettingsKey(userId)
      );

    if (!stored) {
      return {
        ...defaultSettings,
        notifications: {
          ...defaultSettings.notifications,
        },
        sound: {
          ...defaultSettings.sound,
        },
      };
    }

    const parsed =
      JSON.parse(stored);

    return {
      ...defaultSettings,
      ...parsed,

      notifications: {
        ...defaultSettings.notifications,
        ...(parsed?.notifications ||
          {}),
      },

      sound: {
        ...defaultSettings.sound,
        ...(parsed?.sound || {}),
      },
    };
  } catch {
    return {
      ...defaultSettings,
      notifications: {
        ...defaultSettings.notifications,
      },
      sound: {
        ...defaultSettings.sound,
      },
    };
  }
}

export function Settings() {
  const { user } =
    useAuthStore();

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<Section>(
      'appearance'
    );

  const [
    settings,
    setSettings,
  ] =
    useState<SettingsData>(
      defaultSettings
    );

  const [
    courses,
    setCourses,
  ] =
    useState<Course[]>([]);

  const [
    ratings,
    setRatings,
  ] =
    useState<
      Record<
        string,
        UserRating
      >
    >({});

  const [
    ratingSummaries,
    setRatingSummaries,
  ] =
    useState<
      Record<
        string,
        CourseRatingSummary
      >
    >({});

  const [
    selectedCourse,
    setSelectedCourse,
  ] =
    useState('');

  const [
    ratingValue,
    setRatingValue,
  ] = useState(0);

  const [
    ratingComment,
    setRatingComment,
  ] = useState('');

  const [
    loadingCourses,
    setLoadingCourses,
  ] = useState(false);

  const [
    savingRating,
    setSavingRating,
  ] = useState(false);

  const [
    ratingMessage,
    setRatingMessage,
  ] = useState('');

  /*
   * Cada usuário possui suas
   * próprias configurações.
   */
  useEffect(() => {
    if (!user?.id) {
      setSettings({
        ...defaultSettings,
        notifications: {
          ...defaultSettings.notifications,
        },
        sound: {
          ...defaultSettings.sound,
        },
      });

      return;
    }

    setSettings(
      loadSettings(user.id)
    );
  }, [user?.id]);

  /*
   * Salva configurações somente
   * para o usuário atualmente logado.
   */
  const updateSettings = (
    updater:
      | SettingsData
      | ((
          previous: SettingsData
        ) => SettingsData)
  ) => {
    if (!user?.id) {
      return;
    }

    setSettings(
      (previous) => {
        const next =
          typeof updater ===
          'function'
            ? updater(previous)
            : updater;

        try {
          localStorage.setItem(
            getSettingsKey(
              user.id
            ),
            JSON.stringify(next)
          );
        } catch (error) {
          console.error(
            'Erro ao salvar configurações:',
            error
          );
        }

        return next;
      }
    );
  };

  /*
   * Carrega somente cursos publicados.
   */
  useEffect(() => {
    const loadCourses =
      async () => {
        if (!db) {
          setCourses([]);
          return;
        }

        /*
         * Criamos uma referência local
         * depois da validação para que
         * o TypeScript saiba que o
         * Firestore não é null.
         */
        const firestore = db;

        setLoadingCourses(true);

        try {
          const coursesQuery =
            query(
              collection(
                firestore,
                'courses'
              ),
              where(
                'published',
                '==',
                true
              )
            );

          const snapshot =
            await getDocs(
              coursesQuery
            );

          const loadedCourses =
            snapshot.docs.map(
              (courseDoc) => {
                const data =
                  courseDoc.data();

                return {
                  id: courseDoc.id,

                  name:
                    typeof data.name ===
                    'string'
                      ? data.name
                      : 'Curso',

                  description:
                    typeof data.description ===
                    'string'
                      ? data.description
                      : '',

                  icon:
                    typeof data.icon ===
                    'string'
                      ? data.icon
                      : '📚',

                  color:
                    typeof data.color ===
                    'string'
                      ? data.color
                      : '#00D4FF',
                };
              }
            );

          setCourses(
            loadedCourses
          );

          if (
            loadedCourses.length >
              0 &&
            !selectedCourse
          ) {
            setSelectedCourse(
              loadedCourses[0].id
            );
          }
        } catch (error) {
          console.error(
            'Erro ao carregar cursos:',
            error
          );
        } finally {
          setLoadingCourses(false);
        }
      };

    loadCourses();
  }, [selectedCourse]);

  /*
   * Carrega as avaliações.
   *
   * courses/{courseId}/ratings/{userId}
   */
  useEffect(() => {
    if (
      !user?.id ||
      !db ||
      courses.length === 0
    ) {
      setRatings({});
      setRatingSummaries({});
      return;
    }

    /*
     * Referência local para resolver
     * o tipo Firestore | null.
     */
    const firestore = db;

    const loadRatings =
      async () => {
        const userRatings:
          Record<
            string,
            UserRating
          > = {};

        const summaries:
          Record<
            string,
            CourseRatingSummary
          > = {};

        for (
          const course of courses
        ) {
          try {
            /*
             * Avaliação deste usuário.
             */
            const userRatingRef =
              doc(
                firestore,
                'courses',
                course.id,
                'ratings',
                user.id
              );

            const userRatingSnapshot =
              await getDoc(
                userRatingRef
              );

            if (
              userRatingSnapshot.exists()
            ) {
              const data =
                userRatingSnapshot.data();

              userRatings[
                course.id
              ] = {
                rating:
                  typeof data.rating ===
                  'number'
                    ? data.rating
                    : 0,

                comment:
                  typeof data.comment ===
                  'string'
                    ? data.comment
                    : '',
              };
            }

            /*
             * Todas as avaliações do curso,
             * usadas para calcular a média.
             */
            const ratingsSnapshot =
              await getDocs(
                collection(
                  firestore,
                  'courses',
                  course.id,
                  'ratings'
                )
              );

            const values =
              ratingsSnapshot.docs
                .map(
                  (
                    ratingDoc
                  ) =>
                    ratingDoc.data()
                      .rating
                )
                .filter(
                  (
                    value
                  ): value is number =>
                    typeof value ===
                      'number' &&
                    value >= 1 &&
                    value <= 5
                );

            const total =
              values.reduce(
                (
                  sum,
                  value
                ) =>
                  sum + value,
                0
              );

            summaries[
              course.id
            ] = {
              average:
                values.length >
                0
                  ? Number(
                      (
                        total /
                        values.length
                      ).toFixed(1)
                    )
                  : 0,

              count:
                values.length,
            };
          } catch (error) {
            console.error(
              `Erro ao carregar avaliação do curso ${course.id}:`,
              error
            );
          }
        }

        setRatings(
          userRatings
        );

        setRatingSummaries(
          summaries
        );
      };

    loadRatings();
  }, [
    user?.id,
    courses,
  ]);

  /*
   * Quando o curso selecionado muda,
   * mostramos a avaliação existente
   * daquele usuário.
   */
  useEffect(() => {
    if (!selectedCourse) {
      setRatingValue(0);
      setRatingComment('');
      return;
    }

    const existing =
      ratings[selectedCourse];

    if (existing) {
      setRatingValue(
        existing.rating
      );

      setRatingComment(
        existing.comment
      );
    } else {
      setRatingValue(0);
      setRatingComment('');
    }

    setRatingMessage('');
  }, [
    selectedCourse,
    ratings,
  ]);

  const saveRating =
    async () => {
      if (
        !user?.id ||
        !db ||
        !selectedCourse
      ) {
        return;
      }

      if (
        ratingValue < 1 ||
        ratingValue > 5
      ) {
        setRatingMessage(
          'Escolha uma nota de 1 a 5 estrelas.'
        );

        return;
      }

      /*
       * Referência local depois
       * da validação do db.
       */
      const firestore = db;

      setSavingRating(true);
      setRatingMessage('');

      try {
        /*
         * Um documento por usuário.
         *
         * courses/{curso}/ratings/{seu UID}
         */
        const ratingRef =
          doc(
            firestore,
            'courses',
            selectedCourse,
            'ratings',
            user.id
          );

        await setDoc(
          ratingRef,
          {
            userId:
              user.id,

            username:
              user.username,

            rating:
              ratingValue,

            comment:
              ratingComment.trim(),

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        setRatings(
          (previous) => ({
            ...previous,

            [selectedCourse]: {
              rating:
                ratingValue,

              comment:
                ratingComment.trim(),
            },
          })
        );

        setRatingMessage(
          '⭐ Avaliação salva com sucesso!'
        );

        /*
         * Atualiza a média do curso.
         */
        const ratingsSnapshot =
          await getDocs(
            collection(
              firestore,
              'courses',
              selectedCourse,
              'ratings'
            )
          );

        const values =
          ratingsSnapshot.docs
            .map(
              (
                ratingDoc
              ) =>
                ratingDoc.data()
                  .rating
            )
            .filter(
              (
                value
              ): value is number =>
                typeof value ===
                  'number' &&
                value >= 1 &&
                value <= 5
            );

        const total =
          values.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        setRatingSummaries(
          (previous) => ({
            ...previous,

            [selectedCourse]: {
              average:
                values.length >
                0
                  ? Number(
                      (
                        total /
                        values.length
                      ).toFixed(1)
                    )
                  : 0,

              count:
                values.length,
            },
          })
        );
      } catch (error) {
        console.error(
          'Erro ao salvar avaliação:',
          error
        );

        setRatingMessage(
          'Não foi possível salvar a avaliação.'
        );
      } finally {
        setSavingRating(false);
      }
    };

  if (!user) {
    return (
      <div
        style={
          styles.center
        }
      >
        <p>
          Carregando
          configurações...
        </p>
      </div>
    );
  }

  return (
    <div
      style={styles.page}
    >
      <div
        style={
          styles.container
        }
      >
        <div
          style={styles.header}
        >
          <div>
            <div
              style={
                styles.eyebrow
              }
            >
              CODEQUEST NEXUS
            </div>

            <h1
              style={
                styles.title
              }
            >
              ⚙️ Configurações
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              Personalize sua
              experiência na
              plataforma.
            </p>
          </div>
        </div>

        <div
          style={styles.layout}
        >
          <aside
            style={
              styles.sidebar
            }
          >
            <MenuButton
              icon="🎨"
              label="Aparência"
              active={
                activeSection ===
                'appearance'
              }
              onClick={() =>
                setActiveSection(
                  'appearance'
                )
              }
            />

            <MenuButton
              icon="🔔"
              label="Notificações"
              active={
                activeSection ===
                'notifications'
              }
              onClick={() =>
                setActiveSection(
                  'notifications'
                )
              }
            />

            <MenuButton
              icon="🔊"
              label="Som"
              active={
                activeSection ===
                'sound'
              }
              onClick={() =>
                setActiveSection(
                  'sound'
                )
              }
            />

            <MenuButton
              icon="🌎"
              label="Preferências"
              active={
                activeSection ===
                'preferences'
              }
              onClick={() =>
                setActiveSection(
                  'preferences'
                )
              }
            />

            <MenuButton
              icon="⭐"
              label="Avaliações"
              active={
                activeSection ===
                'ratings'
              }
              onClick={() =>
                setActiveSection(
                  'ratings'
                )
              }
            />

            <MenuButton
              icon="🔐"
              label="Conta"
              active={
                activeSection ===
                'account'
              }
              onClick={() =>
                setActiveSection(
                  'account'
                )
              }
            />
          </aside>

          <main
            style={
              styles.content
            }
          >
            {activeSection ===
              'appearance' && (
              <AppearanceSection
                settings={
                  settings
                }
                updateSettings={
                  updateSettings
                }
              />
            )}

            {activeSection ===
              'notifications' && (
              <NotificationsSection
                settings={
                  settings
                }
                updateSettings={
                  updateSettings
                }
              />
            )}

            {activeSection ===
              'sound' && (
              <SoundSection
                settings={
                  settings
                }
                updateSettings={
                  updateSettings
                }
              />
            )}

            {activeSection ===
              'preferences' && (
              <PreferencesSection
                settings={
                  settings
                }
                updateSettings={
                  updateSettings
                }
              />
            )}

            {activeSection ===
              'ratings' && (
              <RatingsSection
                courses={
                  courses
                }
                ratings={
                  ratingSummaries
                }
                userRatings={
                  ratings
                }
                selectedCourse={
                  selectedCourse
                }
                setSelectedCourse={
                  setSelectedCourse
                }
                ratingValue={
                  ratingValue
                }
                setRatingValue={
                  setRatingValue
                }
                ratingComment={
                  ratingComment
                }
                setRatingComment={
                  setRatingComment
                }
                saveRating={
                  saveRating
                }
                savingRating={
                  savingRating
                }
                loadingCourses={
                  loadingCourses
                }
                message={
                  ratingMessage
                }
              />
            )}

            {activeSection ===
              'account' && (
              <AccountSection
                user={user}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.menuButton,

        ...(active
          ? styles.menuButtonActive
          : {}),
      }}
    >
      <span
        style={
          styles.menuIcon
        }
      >
        {icon}
      </span>

      <span>
        {label}
      </span>
    </button>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={
        styles.sectionHeader
      }
    >
      <div
        style={
          styles.sectionIcon
        }
      >
        {icon}
      </div>

      <div>
        <h2
          style={
            styles.sectionTitle
          }
        >
          {title}
        </h2>

        <p
          style={
            styles.sectionDescription
          }
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      style={
        styles.settingRow
      }
    >
      <div
        style={
          styles.settingText
        }
      >
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <button
      onClick={() =>
        onChange(!value)
      }
      style={{
        ...styles.toggle,

        background: value
          ? '#00D4FF'
          : '#374151',
      }}
      aria-label="Alternar configuração"
    >
      <span
        style={{
          ...styles.toggleCircle,

          transform: value
            ? 'translateX(22px)'
            : 'translateX(0)',
        }}
      />
    </button>
  );
}

function AppearanceSection({
  settings,
  updateSettings,
}: {
  settings: SettingsData;

  updateSettings: (
    updater:
      | SettingsData
      | ((
          previous: SettingsData
        ) => SettingsData)
  ) => void;
}) {
  return (
    <div
      style={styles.card}
    >
      <SectionTitle
        icon="🎨"
        title="Aparência"
        description="Personalize como o CodeQuest aparece para você."
      />

      <SettingRow
        title="Tema"
        description="Escolha o tema da plataforma."
      >
        <select
          value={
            settings.theme
          }
          onChange={(event) =>
            updateSettings(
              (previous) => ({
                ...previous,

                theme:
                  event.target
                    .value as SettingsData['theme'],
              })
            )
          }
          style={
            styles.select
          }
        >
          <option value="dark">
            Escuro
          </option>

          <option value="light">
            Claro
          </option>

          <option value="system">
            Sistema
          </option>
        </select>
      </SettingRow>

      <SettingRow
        title="Tamanho da interface"
        description="Ajuste o tamanho dos elementos."
      >
        <select
          value={
            settings.interfaceSize
          }
          onChange={(event) =>
            updateSettings(
              (previous) => ({
                ...previous,

                interfaceSize:
                  event.target
                    .value as SettingsData['interfaceSize'],
              })
            )
          }
          style={
            styles.select
          }
        >
          <option value="small">
            Pequeno
          </option>

          <option value="normal">
            Normal
          </option>

          <option value="large">
            Grande
          </option>
        </select>
      </SettingRow>
    </div>
  );
}

function NotificationsSection({
  settings,
  updateSettings,
}: {
  settings: SettingsData;

  updateSettings: (
    updater:
      | SettingsData
      | ((
          previous: SettingsData
        ) => SettingsData)
  ) => void;
}) {
  return (
    <div
      style={styles.card}
    >
      <SectionTitle
        icon="🔔"
        title="Notificações"
        description="Controle quais avisos você deseja receber."
      />

      <SettingRow
        title="Missões"
        description="Receber avisos relacionados às missões."
      >
        <Toggle
          value={
            settings
              .notifications
              .missions
          }
          onChange={(value) =>
            updateSettings(
              (previous) => ({
                ...previous,

                notifications: {
                  ...previous.notifications,

                  missions:
                    value,
                },
              })
            )
          }
        />
      </SettingRow>

      <SettingRow
        title="Conquistas"
        description="Receber aviso quando desbloquear uma conquista."
      >
        <Toggle
          value={
            settings
              .notifications
              .achievements
          }
          onChange={(value) =>
            updateSettings(
              (previous) => ({
                ...previous,

                notifications: {
                  ...previous.notifications,

                  achievements:
                    value,
                },
              })
            )
          }
        />
      </SettingRow>

      <SettingRow
        title="Novas aulas"
        description="Receber avisos sobre novos conteúdos."
      >
        <Toggle
          value={
            settings
              .notifications
              .newLessons
          }
          onChange={(value) =>
            updateSettings(
              (previous) => ({
                ...previous,

                notifications: {
                  ...previous.notifications,

                  newLessons:
                    value,
                },
              })
            )
          }
        />
      </SettingRow>
    </div>
  );
}

function SoundSection({
  settings,
  updateSettings,
}: {
  settings: SettingsData;

  updateSettings: (
    updater:
      | SettingsData
      | ((
          previous: SettingsData
        ) => SettingsData)
  ) => void;
}) {
  return (
    <div
      style={styles.card}
    >
      <SectionTitle
        icon="🔊"
        title="Som"
        description="Controle os sons da plataforma."
      />

      <SettingRow
        title="Sons da interface"
        description="Sons de botões e interações."
      >
        <Toggle
          value={
            settings.sound
              .interface
          }
          onChange={(value) =>
            updateSettings(
              (previous) => ({
                ...previous,

                sound: {
                  ...previous.sound,

                  interface:
                    value,
                },
              })
            )
          }
        />
      </SettingRow>

      <SettingRow
        title="Sons de conquistas"
        description="Som ao desbloquear uma conquista."
      >
        <Toggle
          value={
            settings.sound
              .achievements
          }
          onChange={(value) =>
            updateSettings(
              (previous) => ({
                ...previous,

                sound: {
                  ...previous.sound,

                  achievements:
                    value,
                },
              })
            )
          }
        />
      </SettingRow>
    </div>
  );
}

function PreferencesSection({
  settings,
  updateSettings,
}: {
  settings: SettingsData;

  updateSettings: (
    updater:
      | SettingsData
      | ((
          previous: SettingsData
        ) => SettingsData)
  ) => void;
}) {
  return (
    <div
      style={styles.card}
    >
      <SectionTitle
        icon="🌎"
        title="Preferências"
        description="Configure suas preferências pessoais."
      />

      <SettingRow
        title="Idioma"
        description="Idioma da interface do usuário."
      >
        <select
          value={
            settings.language
          }
          onChange={(event) =>
            updateSettings(
              (previous) => ({
                ...previous,

                language:
                  event.target
                    .value as SettingsData['language'],
              })
            )
          }
          style={
            styles.select
          }
        >
          <option value="pt-BR">
            Português (Brasil)
          </option>

          <option value="en">
            English
          </option>
        </select>
      </SettingRow>
    </div>
  );
}

function RatingsSection({
  courses,
  ratings,
  userRatings,
  selectedCourse,
  setSelectedCourse,
  ratingValue,
  setRatingValue,
  ratingComment,
  setRatingComment,
  saveRating,
  savingRating,
  loadingCourses,
  message,
}: {
  courses: Course[];

  ratings: Record<
    string,
    CourseRatingSummary
  >;

  userRatings: Record<
    string,
    UserRating
  >;

  selectedCourse: string;

  setSelectedCourse: (
    value: string
  ) => void;

  ratingValue: number;

  setRatingValue: (
    value: number
  ) => void;

  ratingComment: string;

  setRatingComment: (
    value: string
  ) => void;

  saveRating: () => void;

  savingRating: boolean;

  loadingCourses: boolean;

  message: string;
}) {
  const selected =
    courses.find(
      (course) =>
        course.id ===
        selectedCourse
    );

  const summary =
    ratings[selectedCourse];

  const existing =
    userRatings[
      selectedCourse
    ];

  return (
    <div
      style={styles.card}
    >
      <SectionTitle
        icon="⭐"
        title="Avaliações dos cursos"
        description="Avalie os cursos e ajude a melhorar a plataforma."
      />

      {loadingCourses ? (
        <div
          style={styles.empty}
        >
          Carregando cursos...
        </div>
      ) : courses.length ===
        0 ? (
        <div
          style={styles.empty}
        >
          <div
            style={
              styles.emptyIcon
            }
          >
            📚
          </div>

          <strong>
            Nenhum curso
            disponível
          </strong>

          <p>
            Os cursos
            publicados
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
          <div
            style={
              styles.courseGrid
            }
          >
            {courses.map(
              (course) => {
                const courseSummary =
                  ratings[
                    course.id
                  ];

                return (
                  <button
                    key={
                      course.id
                    }
                    onClick={() =>
                      setSelectedCourse(
                        course.id
                      )
                    }
                    style={{
                      ...styles.courseCard,

                      ...(selectedCourse ===
                      course.id
                        ? styles.courseCardActive
                        : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.courseIcon,

                        borderColor:
                          course.color ||
                          '#273653',
                      }}
                    >
                      {course.icon ||
                        '📚'}
                    </div>

                    <strong>
                      {course.name}
                    </strong>

                    <span
                      style={
                        styles.courseRating
                      }
                    >
                      {courseSummary &&
                      courseSummary.count >
                        0
                        ? `⭐ ${courseSummary.average} (${courseSummary.count})`
                        : 'Ainda sem avaliações'}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {selected && (
            <div
              style={
                styles.ratingPanel
              }
            >
              <div
                style={
                  styles.selectedCourseHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.smallLabel
                    }
                  >
                    AVALIANDO
                  </div>

                  <h3
                    style={
                      styles.selectedCourseTitle
                    }
                  >
                    {selected.icon ||
                      '📚'}{' '}
                    {
                      selected.name
                    }
                  </h3>
                </div>

                {summary &&
                  summary.count >
                    0 && (
                    <div
                      style={
                        styles.averageBox
                      }
                    >
                      <strong>
                        ⭐{' '}
                        {
                          summary.average
                        }
                      </strong>

                      <span>
                        {
                          summary.count
                        }{' '}
                        avaliações
                      </span>
                    </div>
                  )}
              </div>

              <div
                style={
                  styles.starsArea
                }
              >
                <p
                  style={
                    styles.ratingQuestion
                  }
                >
                  {existing
                    ? 'Sua avaliação'
                    : 'Como você avalia este curso?'}
                </p>

                <div
                  style={
                    styles.stars
                  }
                >
                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (star) => (
                      <button
                        key={
                          star
                        }
                        onClick={() =>
                          setRatingValue(
                            star
                          )
                        }
                        style={{
                          ...styles.starButton,

                          opacity:
                            star <=
                            ratingValue
                              ? 1
                              : 0.3,
                        }}
                        aria-label={`${star} estrelas`}
                      >
                        ★
                      </button>
                    )
                  )}
                </div>
              </div>

              <textarea
                value={
                  ratingComment
                }
                onChange={(
                  event
                ) =>
                  setRatingComment(
                    event.target
                      .value
                  )
                }
                placeholder="Conte o que você achou do curso... (opcional)"
                maxLength={
                  1000
                }
                style={
                  styles.textarea
                }
              />

              <div
                style={
                  styles.ratingFooter
                }
              >
                <span
                  style={
                    styles.characterCount
                  }
                >
                  {
                    ratingComment.length
                  }
                  /1000
                </span>

                <button
                  onClick={
                    saveRating
                  }
                  disabled={
                    savingRating
                  }
                  style={
                    styles.saveButton
                  }
                >
                  {savingRating
                    ? 'Salvando...'
                    : existing
                    ? 'Atualizar avaliação'
                    : 'Enviar avaliação'}
                </button>
              </div>

              {message && (
                <div
                  style={
                    styles.message
                  }
                >
                  {message}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AccountSection({
  user,
}: {
  user: {
    username: string;
    email: string;
    id: string;
  };
}) {
  return (
    <div
      style={styles.card}
    >
      <SectionTitle
        icon="🔐"
        title="Conta"
        description="Informações da sua conta CodeQuest."
      />

      <div
        style={
          styles.accountBox
        }
      >
        <div>
          <span
            style={
              styles.accountLabel
            }
          >
            Usuário
          </span>

          <strong>
            {user.username}
          </strong>
        </div>

        <div>
          <span
            style={
              styles.accountLabel
            }
          >
            E-mail
          </span>

          <strong>
            {user.email}
          </strong>
        </div>

        <div>
          <span
            style={
              styles.accountLabel
            }
          >
            ID da conta
          </span>

          <span
            style={
              styles.accountId
            }
          >
            {user.id}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: '100vh',
    padding: 30,
    color: 'white',
    fontFamily:
      'sans-serif',
    background:
      'radial-gradient(circle at top right, #182447 0%, #080D19 50%, #050811 100%)',
    boxSizing:
      'border-box',
  },

  center: {
    minHeight:
      '60vh',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    color: 'white',
  },

  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },

  header: {
    marginBottom: 25,
  },

  eyebrow: {
    color: '#00D4FF',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 34,
    margin: '6px 0',
  },

  subtitle: {
    color: '#9CA3AF',
    margin: 0,
  },

  layout: {
    display: 'grid',
    gridTemplateColumns:
      '220px minmax(0, 1fr)',
    gap: 20,
    alignItems:
      'start',
  },

  sidebar: {
    background: '#0D1424',
    border:
      '1px solid #1F2937',
    borderRadius: 16,
    padding: 10,
    display: 'flex',
    flexDirection:
      'column',
    gap: 5,
  },

  menuButton: {
    width: '100%',
    border:
      '1px solid transparent',
    borderRadius: 10,
    padding:
      '12px 14px',
    background:
      'transparent',
    color: '#9CA3AF',
    cursor: 'pointer',
    display: 'flex',
    alignItems:
      'center',
    gap: 10,
    textAlign:
      'left',
    fontSize: 14,
  },

  menuButtonActive: {
    background: '#17233A',
    border:
      '1px solid #29415F',
    color: '#00D4FF',
  },

  menuIcon: {
    width: 24,
    textAlign:
      'center',
    fontSize: 17,
  },

  content: {
    minWidth: 0,
  },

  card: {
    background: '#0D1424',
    border:
      '1px solid #1F2937',
    borderRadius: 18,
    padding: 25,
  },

  sectionHeader: {
    display: 'flex',
    gap: 15,
    alignItems:
      'center',
    paddingBottom: 20,
    borderBottom:
      '1px solid #1F2937',
    marginBottom: 5,
  },

  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: '#17233A',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    fontSize: 24,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 20,
  },

  sectionDescription: {
    margin:
      '5px 0 0',
    color: '#9CA3AF',
    fontSize: 13,
  },

  settingRow: {
    minHeight: 70,
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    gap: 20,
    borderBottom:
      '1px solid #1F2937',
    padding:
      '15px 0',
  },

  settingText: {
    display: 'flex',
    flexDirection:
      'column',
    gap: 5,
  },

  select: {
    background: '#111827',
    border:
      '1px solid #374151',
    color: 'white',
    borderRadius: 8,
    padding:
      '9px 12px',
    minWidth: 150,
    outline: 'none',
  },

  toggle: {
    width: 48,
    height: 26,
    border: 'none',
    borderRadius: 20,
    padding: 2,
    cursor: 'pointer',
    transition:
      'background .2s',
  },

  toggleCircle: {
    display: 'block',
    width: 22,
    height: 22,
    background: 'white',
    borderRadius:
      '50%',
    transition:
      'transform .2s',
  },

  courseGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginTop: 20,
  },

  courseCard: {
    minHeight: 130,
    background: '#111827',
    border:
      '1px solid #273653',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection:
      'column',
    gap: 8,
  },

  courseCardActive: {
    border:
      '1px solid #00D4FF',
    boxShadow:
      '0 0 20px rgba(0,212,255,.12)',
  },

  courseIcon: {
    width: 42,
    height: 42,
    border:
      '1px solid #273653',
    borderRadius: 10,
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    fontSize: 22,
  },

  courseRating: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  ratingPanel: {
    marginTop: 20,
    padding: 20,
    background: '#111827',
    border:
      '1px solid #273653',
    borderRadius: 14,
  },

  selectedCourseHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    gap: 20,
    alignItems:
      'center',
  },

  smallLabel: {
    color: '#00D4FF',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
  },

  selectedCourseTitle: {
    margin:
      '5px 0 0',
    fontSize: 20,
  },

  averageBox: {
    display: 'flex',
    flexDirection:
      'column',
    alignItems:
      'flex-end',
    gap: 3,
  },

  starsArea: {
    marginTop: 20,
  },

  ratingQuestion: {
    color: '#D1D5DB',
    margin: 0,
    fontSize: 14,
  },

  stars: {
    display: 'flex',
    gap: 4,
    marginTop: 5,
  },

  starButton: {
    background:
      'transparent',
    border: 'none',
    color: '#FFD700',
    cursor: 'pointer',
    fontSize: 40,
    lineHeight: 1,
    padding: 0,
  },

  textarea: {
    width: '100%',
    minHeight: 120,
    marginTop: 20,
    boxSizing:
      'border-box',
    background: '#0B1220',
    border:
      '1px solid #273653',
    borderRadius: 10,
    padding: 14,
    color: 'white',
    resize: 'vertical',
    outline: 'none',
    fontFamily:
      'inherit',
  },

  ratingFooter: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    gap: 15,
    marginTop: 10,
  },

  characterCount: {
    color: '#6B7280',
    fontSize: 11,
  },

  saveButton: {
    background:
      'linear-gradient(135deg, #00D4FF, #8B5CF6)',
    border: 'none',
    color: 'white',
    borderRadius: 9,
    padding:
      '11px 18px',
    fontWeight:
      'bold',
    cursor: 'pointer',
  },

  message: {
    marginTop: 12,
    padding: 10,
    background: '#17233A',
    border:
      '1px solid #29415F',
    borderRadius: 8,
    color: '#D1D5DB',
    fontSize: 13,
  },

  empty: {
    textAlign:
      'center',
    padding: 50,
    color: '#9CA3AF',
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  accountBox: {
    display: 'grid',
    gap: 0,
    marginTop: 20,
    background: '#111827',
    border:
      '1px solid #273653',
    borderRadius: 12,
    overflow: 'hidden',
  },

  accountLabel: {
    display: 'block',
    color: '#6B7280',
    fontSize: 11,
    marginBottom: 5,
  },

  accountId: {
    color: '#9CA3AF',
    fontSize: 12,
    wordBreak:
      'break-all',
  },
};