import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { getAllCourses } from '@/data/courses';
import { MISSIONS } from '@/data/missions';
import { ACHIEVEMENTS } from '@/data/achievements';
import { useProgress } from '@/hooks/useProgress';

type LessonType = 'pdf' | 'word' | 'video' | 'quiz';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  duration?: number;
  xpReward?: number;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
}

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  teacherId: string;
  published: boolean;
  views: number;
  averageRating: number;
  ratingsCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeLesson(
  value: unknown,
  index: number
): Lesson {
  if (!isRecord(value)) {
    return {
      id: `lesson-${index + 1}`,
      title: `Aula ${index + 1}`,
      description: '',
      type: 'pdf',
      content: '',
      xpReward: 0,
    };
  }

  const rawType = value.type;

  const type: LessonType =
    rawType === 'word' ||
    rawType === 'video' ||
    rawType === 'quiz'
      ? rawType
      : 'pdf';

  return {
    id:
      typeof value.id === 'string'
        ? value.id
        : `lesson-${index + 1}`,

    title:
      typeof value.title === 'string'
        ? value.title
        : `Aula ${index + 1}`,

    description:
      typeof value.description === 'string'
        ? value.description
        : '',

    type,

    content:
      typeof value.content === 'string'
        ? value.content
        : '',

    duration:
      typeof value.duration === 'number'
        ? value.duration
        : undefined,

    xpReward:
      typeof value.xpReward === 'number'
        ? value.xpReward
        : 0,

    fileName:
      typeof value.fileName === 'string'
        ? value.fileName
        : undefined,

    fileUrl:
      typeof value.fileUrl === 'string'
        ? value.fileUrl
        : undefined,

    fileSize:
      typeof value.fileSize === 'number'
        ? value.fileSize
        : undefined,

    fileType:
      typeof value.fileType === 'string'
        ? value.fileType
        : undefined,
  };
}

function normalizeCourse(
  id: string,
  value: Record<string, unknown>
): Course {
  const lessons = Array.isArray(value.lessons)
    ? value.lessons.map(normalizeLesson)
    : [];

  return {
    id,

    slug:
      typeof value.slug === 'string' &&
      value.slug.trim()
        ? value.slug
        : id,

    name:
      typeof value.name === 'string' &&
      value.name.trim()
        ? value.name
        : 'Curso sem nome',

    description:
      typeof value.description === 'string'
        ? value.description
        : '',

    icon:
      typeof value.icon === 'string'
        ? value.icon
        : '📚',

    color:
      typeof value.color === 'string'
        ? value.color
        : '#00D4FF',

    lessons,

    teacherId:
      typeof value.teacherId === 'string'
        ? value.teacherId
        : '',

    published: value.published === true,

    views:
      typeof value.views === 'number'
        ? value.views
        : 0,

    averageRating:
      typeof value.averageRating === 'number'
        ? value.averageRating
        : 0,

    ratingsCount:
      typeof value.ratingsCount === 'number'
        ? value.ratingsCount
        : 0,
  };
}

function getLocalFallbackCourses(): Course[] {
  return getAllCourses().map((course) => ({
    id: course.id,
    slug: course.slug,
    name: course.name,
    description: course.description,
    icon: course.icon,
    color: course.color,

    lessons: course.lessons.map((lesson) => {
      const rawLesson =
        lesson as unknown as Record<string, unknown>;

      const rawType = rawLesson.type;

      const type: LessonType =
        rawType === 'word' ||
        rawType === 'video' ||
        rawType === 'quiz'
          ? rawType
          : 'pdf';

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type,
        content: lesson.content,
        duration: lesson.duration,
        xpReward: lesson.xpReward,

        fileName:
          typeof rawLesson.fileName === 'string'
            ? rawLesson.fileName
            : undefined,

        fileUrl:
          typeof rawLesson.fileUrl === 'string'
            ? rawLesson.fileUrl
            : undefined,

        fileSize:
          typeof rawLesson.fileSize === 'number'
            ? rawLesson.fileSize
            : undefined,

        fileType:
          typeof rawLesson.fileType === 'string'
            ? rawLesson.fileType
            : undefined,
      };
    }),

    teacherId: '',
    published: true,
    views: 0,
    averageRating: 0,
    ratingsCount: 0,
  }));
}

function getCourseProgress(
  course: Course,
  completedLessons: Set<string>
) {
  const total = course.lessons.length;

  if (total === 0) {
    return {
      completed: 0,
      percent: 0,
    };
  }

  const completed = course.lessons.filter(
    (lesson) =>
      completedLessons.has(lesson.id)
  ).length;

  return {
    completed,
    percent: Math.round(
      (completed / total) * 100
    ),
  };
}

function getLevelData(xp: number) {
  const safeXp = Math.max(0, xp);

  const xpForLevel = (level: number) =>
    100 * Math.pow(level, 1.5);

  let level = 1;
  let xpSpent = 0;

  for (
    let current = 1;
    current <= 100;
    current++
  ) {
    const needed = xpForLevel(current);

    if (
      safeXp >=
      xpSpent + needed
    ) {
      xpSpent += needed;
      level = current + 1;
    } else {
      break;
    }
  }

  const xpIntoLevel = Math.max(
    0,
    safeXp - xpSpent
  );

  const xpNeededForNextLevel =
    xpForLevel(level);

  const percent =
    xpNeededForNextLevel > 0
      ? Math.min(
          100,
          Math.round(
            (xpIntoLevel /
              xpNeededForNextLevel) *
              100
          )
        )
      : 0;

  return {
    level,
    xpIntoLevel,
    xpNeededForNextLevel,
    percent,
  };
}

export function Dashboard() {
  const { user } = useAuthStore();

  /*
   * IMPORTANTE:
   * O Dashboard agora usa exatamente o mesmo
   * progresso utilizado pelo Lesson.
   *
   * Não existe mais leitura direta de:
   * codequest-progress-direct
   *
   * O progresso vem de:
   * users/{userId}/progress/main
   */
  const {
    progress,
    loading: progressLoading,
  } = useProgress();

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [coursesLoading, setCoursesLoading] =
    useState(true);

  const [coursesError, setCoursesError] =
    useState('');

  /*
   * Carrega somente cursos publicados.
   */
  useEffect(() => {
    if (!user) {
      setCourses([]);
      setCoursesLoading(false);
      return;
    }

    if (!db) {
      setCourses(
        getLocalFallbackCourses()
      );

      setCoursesLoading(false);
      setCoursesError('');

      return;
    }

    setCoursesLoading(true);
    setCoursesError('');

    const coursesQuery = query(
      collection(db, 'courses'),
      where(
        'published',
        '==',
        true
      )
    );

    const unsubscribe = onSnapshot(
      coursesQuery,

      (snapshot) => {
        const loaded = snapshot.docs
          .map((item) =>
            normalizeCourse(
              item.id,
              item.data()
            )
          )
          .filter(
            (course) =>
              course.lessons.length > 0
          );

        setCourses(loaded);
        setCoursesLoading(false);
        setCoursesError('');
      },

      (error) => {
        console.error(
          'Erro ao carregar cursos publicados:',
          error
        );

        setCourses([]);
        setCoursesLoading(false);

        setCoursesError(
          'Não foi possível carregar os cursos publicados.'
        );
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  /*
   * Todos estes números agora vêm do useProgress().
   */
  const totalCompleted =
    progress.completedLessons.length;

  const totalDownloaded =
    progress.downloadedLessons.length;

  const levelData = useMemo(
    () =>
      getLevelData(progress.xp),
    [progress.xp]
  );

  const completedSet = useMemo(
    () =>
      new Set(
        progress.completedLessons
      ),
    [progress.completedLessons]
  );

  const coursesWithProgress = useMemo(
    () =>
      courses.map((course) => ({
        ...course,

        progress:
          getCourseProgress(
            course,
            completedSet
          ),
      })),
    [courses, completedSet]
  );

  const coursesInProgress =
    coursesWithProgress
      .filter(
        (course) =>
          course.progress.percent > 0 &&
          course.progress.percent < 100
      )
      .slice(0, 3);

  const activeCoursesCount =
    coursesWithProgress.filter(
      (course) =>
        course.progress.percent > 0
    ).length;

  /*
   * Próxima aula.
   */
  const nextLesson = useMemo(() => {
    const started =
      coursesWithProgress.filter(
        (course) =>
          course.progress.percent > 0 &&
          course.progress.percent < 100
      );

    const ordered = [
      ...started,

      ...coursesWithProgress.filter(
        (course) =>
          !started.some(
            (item) =>
              item.id === course.id
          )
      ),
    ];

    for (const course of ordered) {
      const lesson =
        course.lessons.find(
          (item) =>
            !completedSet.has(
              item.id
            )
        );

      if (lesson) {
        return {
          course,
          lesson,
        };
      }
    }

    return null;
  }, [
    coursesWithProgress,
    completedSet,
  ]);

  /*
   * Missões.
   */
  const dailyMissions =
    MISSIONS
      .filter(
        (mission) =>
          mission.type === 'daily'
      )
      .map((mission) => {
        let current = 0;

        if (
          mission.id === 'm1' ||
          mission.id === 'm2'
        ) {
          current =
            totalCompleted;
        }

        if (mission.id === 'm3') {
          current =
            coursesWithProgress.filter(
              (course) =>
                course.progress.percent > 0
            ).length;
        }

        return {
          ...mission,

          progress:
            Math.min(
              current,
              mission.target
            ),

          completed:
            current >=
            mission.target,
        };
      });

  /*
   * Conquistas.
   */
  const recentAchievements =
    ACHIEVEMENTS
      .slice(0, 4)
      .map((achievement) => {
        let current = 0;

        if (
          achievement.criteria.type ===
          'lessons_completed'
        ) {
          current =
            totalCompleted;
        }

        if (
          achievement.criteria.type ===
          'xp_earned'
        ) {
          current =
            progress.xp;
        }

        if (
          achievement.criteria.type ===
          'downloads'
        ) {
          current =
            totalDownloaded;
        }

        return {
          ...achievement,

          unlocked:
            current >=
            achievement.criteria.target,
        };
      });

  if (!user) {
    return (
      <div style={styles.center}>
        <p>
          Carregando usuário...
        </p>
      </div>
    );
  }

  /*
   * Enquanto o progresso individual está
   * sendo carregado, evitamos mostrar números
   * temporários errados.
   */
  if (progressLoading) {
    return (
      <div style={styles.center}>
        <p>
          Carregando seu progresso...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.date}>
          {new Date().toLocaleDateString(
            'pt-BR',
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }
          )}
        </p>

        <h1 style={styles.title}>
          Bem-vindo,{' '}
          <span style={styles.cyan}>
            {user.username}
          </span>
          !
        </h1>

        <p style={styles.subtitle}>
          {user.title} • Nível{' '}
          {levelData.level}
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div
          style={{
            ...styles.statCard,
            borderColor:
              '#00D4FF40',
          }}
        >
          <div style={styles.statIcon}>
            ⚡
          </div>

          <div>
            <p style={styles.statLabel}>
              XP Total
            </p>

            <p
              style={{
                ...styles.statValue,
                color: '#00D4FF',
              }}
            >
              {progress.xp.toLocaleString(
                'pt-BR'
              )}
            </p>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${levelData.percent}%`,
                background:
                  'linear-gradient(90deg, #00D4FF, #8B5CF6)',
              }}
            />
          </div>

          <p style={styles.progressText}>
            {Math.floor(
              levelData.xpIntoLevel
            )}{' '}
            /{' '}
            {Math.floor(
              levelData.xpNeededForNextLevel
            )}{' '}
            para o nível{' '}
            {levelData.level + 1}
          </p>
        </div>

        <StatCard
          icon="✓"
          label="Lições Completas"
          value={totalCompleted}
          color="#00FF88"
        />

        <StatCard
          icon="📄"
          label="PDFs Baixados"
          value={totalDownloaded}
          color="#8B5CF6"
        />

        <StatCard
          icon="🚀"
          label="Cursos Ativos"
          value={activeCoursesCount}
          color="#FFD700"
        />
      </div>

      {nextLesson && (
        <div
          style={{
            ...styles.continueCard,
            borderColor:
              nextLesson.course.color,
            boxShadow:
              `0 0 30px ${nextLesson.course.color}40`,
          }}
        >
          <h2 style={styles.sectionTitle}>
            ⚡ Continue Aprendendo
          </h2>

          <div style={styles.continueContent}>
            <div
              style={
                styles.courseIconLarge
              }
            >
              {nextLesson.course.icon}
            </div>

            <div style={styles.continueInfo}>
              <p
                style={{
                  ...styles.eyebrow,
                  color:
                    nextLesson.course.color,
                }}
              >
                {nextLesson.course.name}
              </p>

              <h3 style={styles.lessonTitle}>
                {nextLesson.lesson.title}
              </h3>

              <p style={styles.description}>
                {nextLesson.lesson.description ||
                  'Continue sua jornada de aprendizado.'}
              </p>
            </div>

            <Link
              to={`/lesson/${nextLesson.course.slug}/${nextLesson.lesson.id}`}
              style={{
                ...styles.primaryButton,
                background:
                  nextLesson.course.color,
              }}
            >
              Continuar →
            </Link>
          </div>
        </div>
      )}

      <div style={styles.contentGrid}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>
              🎯 Missões Diárias
            </h2>

            <Link
              to="/missions"
              style={styles.link}
            >
              Ver todas →
            </Link>
          </div>

          {dailyMissions
            .slice(0, 3)
            .map((mission) => {
              const percent =
                mission.target > 0
                  ? (mission.progress /
                      mission.target) *
                    100
                  : 0;

              return (
                <div
                  key={mission.id}
                  style={{
                    ...styles.mission,
                    borderColor:
                      mission.completed
                        ? '#00FF88'
                        : '#1F2937',
                  }}
                >
                  <div
                    style={
                      styles.missionHeader
                    }
                  >
                    <p
                      style={
                        styles.missionTitle
                      }
                    >
                      {mission.title}
                    </p>

                    <span
                      style={
                        styles.missionXp
                      }
                    >
                      +{mission.xpReward} XP
                    </span>
                  </div>

                  <div
                    style={
                      styles.progressTrack
                    }
                  >
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(
                          percent,
                          100
                        )}%`,
                        background:
                          mission.completed
                            ? 'linear-gradient(90deg, #00FF88, #10B981)'
                            : 'linear-gradient(90deg, #00D4FF, #8B5CF6)',
                      }}
                    />
                  </div>

                  <p
                    style={
                      styles.progressText
                    }
                  >
                    {mission.progress}/
                    {mission.target}
                  </p>
                </div>
              );
            })}
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>
              🏆 Conquistas
            </h2>

            <Link
              to="/achievements"
              style={{
                ...styles.link,
                color: '#FFD700',
              }}
            >
              Ver todas →
            </Link>
          </div>

          <div style={styles.achievementsGrid}>
            {recentAchievements.map(
              (achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    ...styles.achievement,
                    opacity:
                      achievement.unlocked
                        ? 1
                        : 0.4,
                  }}
                >
                  <div
                    style={
                      styles.achievementIcon
                    }
                  >
                    {achievement.unlocked
                      ? achievement.icon
                      : '🔒'}
                  </div>

                  <p
                    style={
                      styles.achievementName
                    }
                  >
                    {achievement.name}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <section
          style={{
            ...styles.card,
            gridColumn: 'span 2',
          }}
        >
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                📚 Cursos
              </h2>

              <p style={styles.cardHint}>
                Cursos publicados pelos
                professores.
              </p>
            </div>

            <Link
              to="/galaxy"
              style={styles.link}
            >
              Ver galáxia →
            </Link>
          </div>

          {coursesLoading ? (
            <div style={styles.empty}>
              Carregando cursos...
            </div>
          ) : coursesError ? (
            <div style={styles.empty}>
              <p>{coursesError}</p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                style={
                  styles.retryButton
                }
              >
                Tentar novamente
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div style={styles.empty}>
              <div
                style={
                  styles.emptyIcon
                }
              >
                🪐
              </div>

              <strong>
                Nenhum curso publicado ainda
              </strong>

              <p style={styles.cardHint}>
                Quando um professor publicar
                um curso, ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {coursesWithProgress
                .slice(0, 6)
                .map((course) => {
                  const firstIncomplete =
                    course.lessons.find(
                      (lesson) =>
                        !completedSet.has(
                          lesson.id
                        )
                    );

                  const targetLesson =
                    firstIncomplete ||
                    course.lessons[0];

                  if (!targetLesson) {
                    return null;
                  }

                  return (
                    <Link
                      key={course.id}
                      to={`/lesson/${course.slug}/${targetLesson.id}`}
                      style={
                        styles.courseLink
                      }
                    >
                      <div
                        style={{
                          ...styles.courseCard,
                          borderColor:
                            `${course.color}40`,
                        }}
                      >
                        <div
                          style={
                            styles.courseIcon
                          }
                        >
                          {course.icon}
                        </div>

                        <h3
                          style={{
                            ...styles.courseName,
                            color:
                              course.color,
                          }}
                        >
                          {course.name}
                        </h3>

                        <p
                          style={
                            styles.courseDescription
                          }
                        >
                          {course.description ||
                            'Curso disponível para você.'}
                        </p>

                        <div
                          style={
                            styles.progressTrack
                          }
                        >
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${course.progress.percent}%`,
                              background:
                                course.color,
                            }}
                          />
                        </div>

                        <p
                          style={
                            styles.progressText
                          }
                        >
                          {course.progress.completed}
                          /
                          {course.lessons.length}{' '}
                          aulas •{' '}
                          {course.progress.percent}
                          %
                        </p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}

          {coursesInProgress.length > 0 && (
            <div
              style={
                styles.inProgressBlock
              }
            >
              <h3
                style={
                  styles.subsectionTitle
                }
              >
                🚀 Seus cursos em progresso
              </h3>

              <div style={styles.coursesGrid}>
                {coursesInProgress.map(
                  (course) => {
                    const next =
                      course.lessons.find(
                        (lesson) =>
                          !completedSet.has(
                            lesson.id
                          )
                      ) ||
                      course.lessons[0];

                    if (!next) {
                      return null;
                    }

                    return (
                      <Link
                        key={`progress-${course.id}`}
                        to={`/lesson/${course.slug}/${next.id}`}
                        style={
                          styles.courseLink
                        }
                      >
                        <div
                          style={{
                            ...styles.courseCard,
                            borderColor:
                              `${course.color}80`,
                          }}
                        >
                          <div
                            style={
                              styles.courseRow
                            }
                          >
                            <span
                              style={
                                styles.courseIconSmall
                              }
                            >
                              {course.icon}
                            </span>

                            <strong
                              style={{
                                color:
                                  course.color,
                              }}
                            >
                              {course.name}
                            </strong>
                          </div>

                          <div
                            style={
                              styles.progressTrack
                            }
                          >
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${course.progress.percent}%`,
                                background:
                                  course.color,
                              }}
                            />
                          </div>

                          <p
                            style={
                              styles.progressText
                            }
                          >
                            {course.progress.percent}
                            % completo
                          </p>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        borderColor:
          `${color}40`,
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
      }}
    >
      <div style={styles.statBigIcon}>
        {icon}
      </div>

      <div>
        <p style={styles.statLabel}>
          {label}
        </p>

        <p
          style={{
            ...styles.statValue,
            color,
          }}
        >
          {value.toLocaleString(
            'pt-BR'
          )}
        </p>
      </div>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    padding: 20,
    color: 'white',
    fontFamily: 'sans-serif',
    minHeight: '100vh',
  },

  center: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },

  header: {
    marginBottom: 30,
  },

  date: {
    color: '#9CA3AF',
    fontSize: 14,
    margin: 0,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: '5px 0 0',
  },

  cyan: {
    color: '#00D4FF',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 5,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 15,
    marginBottom: 30,
  },

  statCard: {
    background: '#111827',
    border: '1px solid',
    borderRadius: 10,
    padding: 20,
    minHeight: 80,
  },

  statIcon: {
    fontSize: 24,
  },

  statBigIcon: {
    fontSize: 40,
  },

  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    margin: 0,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: '2px 0 0',
  },

  progressTrack: {
    background: '#1F2937',
    borderRadius: 10,
    height: 6,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  progressText: {
    color: '#9CA3AF',
    fontSize: 11,
    margin: '5px 0 0',
  },

  continueCard: {
    background: '#111827',
    border: '2px solid',
    borderRadius: 10,
    padding: 25,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 0,
  },

  continueContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 15,
  },

  courseIconLarge: {
    fontSize: 50,
  },

  continueInfo: {
    flex: 1,
    minWidth: 200,
  },

  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    margin: 0,
  },

  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: '5px 0 0',
  },

  description: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 5,
  },

  primaryButton: {
    padding: '12px 24px',
    color: 'black',
    borderRadius: 5,
    textDecoration: 'none',
    fontWeight: 'bold',
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(350px, 1fr))',
    gap: 20,
  },

  card: {
    background: '#111827',
    border: '1px solid #1F2937',
    borderRadius: 10,
    padding: 25,
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },

  link: {
    color: '#00D4FF',
    fontSize: 12,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },

  cardHint: {
    color: '#9CA3AF',
    fontSize: 12,
    margin: '5px 0 0',
  },

  mission: {
    padding: 12,
    background: '#0A1020',
    border: '1px solid',
    borderRadius: 8,
    marginBottom: 10,
  },

  missionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },

  missionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    margin: 0,
  },

  missionXp: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },

  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },

  achievement: {
    textAlign: 'center',
    padding: 10,
    background: '#0A1020',
    borderRadius: 8,
  },

  achievementIcon: {
    fontSize: 30,
  },

  achievementName: {
    fontSize: 10,
    marginTop: 5,
    color: '#9CA3AF',
  },

  coursesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 15,
  },

  courseLink: {
    textDecoration: 'none',
    color: 'inherit',
  },

  courseCard: {
    background: '#0A1020',
    border: '1px solid',
    borderRadius: 8,
    padding: 15,
    height: '100%',
    boxSizing: 'border-box',
  },

  courseIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  courseName: {
    fontWeight: 'bold',
    fontSize: 14,
    margin: 0,
  },

  courseDescription: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 1.4,
    minHeight: 32,
  },

  courseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  courseIconSmall: {
    fontSize: 28,
  },

  inProgressBlock: {
    marginTop: 25,
    paddingTop: 20,
    borderTop: '1px solid #1F2937',
  },

  subsectionTitle: {
    fontSize: 15,
    margin: '0 0 15px',
  },

  empty: {
    minHeight: 150,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#D1D5DB',
    gap: 8,
  },

  emptyIcon: {
    fontSize: 42,
  },

  retryButton: {
    marginTop: 5,
    border: '1px solid #00D4FF',
    background: '#0A1020',
    color: '#00D4FF',
    borderRadius: 6,
    padding: '8px 14px',
    cursor: 'pointer',
  },
};