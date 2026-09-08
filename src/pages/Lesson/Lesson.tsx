import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { downloadLessonPDF } from '@/utils/pdfGenerator';

const STORAGE_KEY = 'codequest-progress-direct';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'quiz';
  content?: string;
  duration?: number;
  xpReward?: number;
  language?: string;
  codeExample?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: unknown;
}

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  planetName: string;
  teacherId: string;
  lessons: Lesson[];
}

interface ProgressData {
  completedLessons: string[];
  downloadedLessons: string[];
  xp: number;
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  );
}

function convertLesson(
  value: unknown
): Lesson {
  if (!isRecord(value)) {
    return {
      id: '',
      title: 'Aula sem título',
      type: 'pdf',
      content: '',
      xpReward: 0,
    };
  }

  let type: Lesson['type'] = 'pdf';

  if (value.type === 'video') {
    type = 'video';
  } else if (value.type === 'quiz') {
    type = 'quiz';
  }

  return {
    id:
      typeof value.id === 'string'
        ? value.id
        : '',

    title:
      typeof value.title === 'string'
        ? value.title
        : 'Aula sem título',

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

    language:
      typeof value.language === 'string'
        ? value.language
        : undefined,

    codeExample:
      typeof value.codeExample === 'string'
        ? value.codeExample
        : undefined,

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

    uploadedAt:
      value.uploadedAt,
  };
}

function convertCourse(
  courseId: string,
  data: Record<string, unknown>
): Course {
  const slug =
    typeof data.slug === 'string' &&
    data.slug.trim()
      ? data.slug
      : courseId;

  const rawLessons: unknown[] =
    Array.isArray(data.lessons)
      ? data.lessons
      : [];

  const lessons: Lesson[] =
    rawLessons.map(convertLesson);

  return {
    id: courseId,

    slug,

    name:
      typeof data.name === 'string'
        ? data.name
        : 'Curso sem nome',

    description:
      typeof data.description === 'string'
        ? data.description
        : '',

    icon:
      typeof data.icon === 'string'
        ? data.icon
        : '🚀',

    color:
      typeof data.color === 'string'
        ? data.color
        : '#6366F1',

    planetName:
      typeof data.planetName === 'string'
        ? data.planetName
        : typeof data.name === 'string'
          ? data.name
          : 'Curso',

    teacherId:
      typeof data.teacherId === 'string'
        ? data.teacherId
        : '',

    lessons,
  };
}

export function Lesson() {
  const {
    courseSlug,
    lessonId,
  } = useParams<{
    courseSlug: string;
    lessonId: string;
  }>();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [completed, setCompleted] =
    useState(false);

  const [downloaded, setDownloaded] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      const firestore = db;

      if (!firestore || !courseSlug) {
        if (!cancelled) {
          setCourse(null);
          setLesson(null);
          setLoading(false);
        }

        return;
      }

      try {
        const coursesRef =
          collection(
            firestore,
            'courses'
          );

        const coursesQuery =
          query(
            coursesRef,
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

        let selectedCourse:
          Course | null = null;

        for (
          const courseDoc of snapshot.docs
        ) {
          const data =
            courseDoc.data();

          const possibleSlug =
            typeof data.slug === 'string' &&
            data.slug.trim()
              ? data.slug
              : courseDoc.id;

          if (
            possibleSlug !== courseSlug
          ) {
            continue;
          }

          selectedCourse =
            convertCourse(
              courseDoc.id,
              data
            );

          break;
        }

        if (cancelled) {
          return;
        }

        if (!selectedCourse) {
          setCourse(null);
          setLesson(null);
          return;
        }

        const selectedLesson:
          Lesson | null =
          selectedCourse.lessons.find(
            (
              item: Lesson
            ) =>
              item.id === lessonId
          ) || null;

        setCourse(
          selectedCourse
        );

        setLesson(
          selectedLesson
        );
      } catch (error) {
        console.error(
          'Erro ao carregar curso:',
          error
        );

        if (!cancelled) {
          setCourse(null);
          setLesson(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [
    courseSlug,
    lessonId,
  ]);

  useEffect(() => {
    if (!lesson) {
      setCompleted(false);
      setDownloaded(false);
      return;
    }

    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) {
        setCompleted(false);
        setDownloaded(false);
        return;
      }

      const parsed: unknown =
        JSON.parse(stored);

      if (
        !isRecord(parsed)
      ) {
        setCompleted(false);
        setDownloaded(false);
        return;
      }

      const completedLessons =
        Array.isArray(
          parsed.completedLessons
        )
          ? parsed.completedLessons
          : [];

      const downloadedLessons =
        Array.isArray(
          parsed.downloadedLessons
        )
          ? parsed.downloadedLessons
          : [];

      setCompleted(
        completedLessons.includes(
          lesson.id
        )
      );

      setDownloaded(
        downloadedLessons.includes(
          lesson.id
        )
      );
    } catch (error) {
      console.error(
        'Erro ao carregar progresso:',
        error
      );
    }
  }, [
    lesson?.id,
  ]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
        }}
      >
        Carregando curso...
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div
        style={{
          padding: '40px',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h2>
          Lição não encontrada
        </h2>

        <p
          style={{
            color: '#9CA3AF',
          }}
        >
          O curso ou a aula não foi
          encontrado no Firebase.
        </p>

        <Link
          to="/galaxy"
          style={{
            color: '#00D4FF',
          }}
        >
          Voltar à Galáxia
        </Link>
      </div>
    );
  }

  const currentIndex: number =
    course.lessons.findIndex(
      (
        item: Lesson
      ) =>
        item.id === lessonId
    );

  const previousLesson:
    Lesson | null =
    currentIndex > 0
      ? course.lessons[
          currentIndex - 1
        ]
      : null;

  const nextLesson:
    Lesson | null =
    currentIndex >= 0 &&
    currentIndex <
      course.lessons.length - 1
      ? course.lessons[
          currentIndex + 1
        ]
      : null;

  const saveProgress = (
    data: ProgressData
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        'Erro ao salvar progresso:',
        error
      );
    }
  };

  const getProgress =
    (): ProgressData => {
      const defaultProgress: ProgressData =
        {
          completedLessons: [],
          downloadedLessons: [],
          xp: 0,
        };

      try {
        const stored =
          localStorage.getItem(
            STORAGE_KEY
          );

        if (!stored) {
          return defaultProgress;
        }

        const parsed: unknown =
          JSON.parse(stored);

        if (
          !isRecord(parsed)
        ) {
          return defaultProgress;
        }

        return {
          completedLessons:
            Array.isArray(
              parsed.completedLessons
            )
              ? parsed.completedLessons.filter(
                  (
                    value: unknown
                  ): value is string =>
                    typeof value ===
                    'string'
                )
              : [],

          downloadedLessons:
            Array.isArray(
              parsed.downloadedLessons
            )
              ? parsed.downloadedLessons.filter(
                  (
                    value: unknown
                  ): value is string =>
                    typeof value ===
                    'string'
                )
              : [],

          xp:
            typeof parsed.xp === 'number'
              ? parsed.xp
              : 0,
        };
      } catch (error) {
        console.error(
          'Erro ao ler progresso:',
          error
        );

        return defaultProgress;
      }
    };

  const handleComplete =
    () => {
      const current =
        getProgress();

      if (completed) {
        const updatedProgress: ProgressData =
          {
            ...current,

            completedLessons:
              current.completedLessons.filter(
                (
                  id: string
                ) =>
                  id !== lesson.id
              ),

            xp: Math.max(
              0,
              current.xp -
                (lesson.xpReward || 0)
            ),
          };

        setCompleted(false);

        saveProgress(
          updatedProgress
        );

        return;
      }

      const alreadyCompleted =
        current.completedLessons.includes(
          lesson.id
        );

      const updatedProgress: ProgressData =
        {
          ...current,

          completedLessons:
            alreadyCompleted
              ? current.completedLessons
              : [
                  ...current.completedLessons,
                  lesson.id,
                ],

          xp:
            current.xp +
            (alreadyCompleted
              ? 0
              : lesson.xpReward || 0),
        };

      setCompleted(true);

      saveProgress(
        updatedProgress
      );
    };

  const handleDownload =
    () => {
      try {
        const current =
          getProgress();

        const alreadyDownloaded =
          current.downloadedLessons.includes(
            lesson.id
          );

        const updatedProgress: ProgressData =
          {
            ...current,

            downloadedLessons:
              alreadyDownloaded
                ? current.downloadedLessons
                : [
                    ...current.downloadedLessons,
                    lesson.id,
                  ],
          };

        saveProgress(
          updatedProgress
        );

        setDownloaded(true);

        downloadLessonPDF(
          lesson as any,
          course as any
        );
      } catch (error) {
        console.error(
          'Erro ao gerar PDF:',
          error
        );
      }
    };

  const renderContent = (
    markdown: string
  ): string => {
    const html =
      markdown
        .replace(
          /^### (.*$)/gim,
          '<h3>$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2>$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1>$1</h1>'
        )
        .replace(
          /```(\w+)?\n([\s\S]*?)```/g,
          '<pre><code>$2</code></pre>'
        )
        .replace(
          /`([^`]+)`/g,
          '<code>$1</code>'
        )
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong>$1</strong>'
        )
        .replace(
          /^\- (.*$)/gim,
          '<li>$1</li>'
        )
        .replace(
          /(<li>.*<\/li>)/s,
          '<ul>$1</ul>'
        )
        .split('\n\n')
        .map(
          (
            block: string
          ): string => {
            if (
              block.startsWith('<h') ||
              block.startsWith('<pre') ||
              block.startsWith('<ul')
            ) {
              return block;
            }

            return `<p>${block.replace(
              /\n/g,
              '<br>'
            )}</p>`;
          }
        )
        .join('\n');

    return html;
  };

  const courseColor =
    course.color || '#6366F1';

  const lessonContent =
    lesson.content || '';

  return (
    <div
      style={{
        padding: '20px',
        color: 'white',
        fontFamily: 'sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          marginBottom: '20px',
          gap: '15px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/galaxy"
          style={{
            color: '#00D4FF',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          ← Galáxia
        </Link>

        <span
          style={{
            color: courseColor,
            fontWeight: 'bold',
          }}
        >
          {course.icon} {course.name}
        </span>
      </div>

      <div
        style={{
          background: '#111827',
          border: `2px solid ${courseColor}`,
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: `0 0 30px ${courseColor}40`,
        }}
      >
        <p
          style={{
            color: courseColor,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 'bold',
          }}
        >
          {course.planetName} •
          Lição {currentIndex + 1} de{' '}
          {course.lessons.length}
        </p>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginTop: '10px',
          }}
        >
          {lesson.title}
        </h1>

        <p
          style={{
            color: '#9CA3AF',
            marginTop: '10px',
          }}
        >
          {lesson.description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '15px',
            fontSize: '13px',
            color: '#9CA3AF',
            flexWrap: 'wrap',
          }}
        >
          {lesson.duration !==
            undefined && (
            <span>
              ⏱ {lesson.duration} min
            </span>
          )}

          <span
            style={{
              color: '#FFD700',
              fontWeight: 'bold',
            }}
          >
            ⚡ +{lesson.xpReward || 0}{' '}
            XP
          </span>

          {lesson.language && (
            <span>
              💻 {lesson.language}
            </span>
          )}

          <span>
            {lesson.type === 'pdf' &&
              '📄 PDF'}

            {lesson.type === 'video' &&
              '🎥 Vídeo'}

            {lesson.type === 'quiz' &&
              '🧠 Quiz'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={
              handleComplete
            }
            style={{
              padding: '12px 24px',
              background: completed
                ? '#00FF88'
                : courseColor,
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {completed
              ? '✓ COMPLETA (clique para desmarcar)'
              : '✓ Marcar como Completa'}
          </button>

          {lesson.type === 'pdf' && (
            <button
              onClick={
                handleDownload
              }
              style={{
                padding: '12px 24px',
                background:
                  'transparent',
                color: 'white',
                border:
                  '1px solid #8B5CF6',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {downloaded
                ? '📄 Baixado - Gerar PDF'
                : '📄 Baixar PDF'}
            </button>
          )}
        </div>
      </div>

      {lesson.type === 'pdf' &&
        lesson.fileUrl && (
          <div
            style={{
              background: '#111827',
              border:
                '1px solid #1F2937',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '15px',
              }}
            >
              📄 Material da aula
            </h2>

            <iframe
              src={lesson.fileUrl}
              title={
                lesson.fileName ||
                lesson.title
              }
              style={{
                width: '100%',
                height: '700px',
                border: 'none',
                borderRadius: '8px',
                background: 'white',
              }}
            />
          </div>
        )}

      {lesson.type === 'video' &&
        lesson.fileUrl && (
          <div
            style={{
              background: '#111827',
              border:
                '1px solid #1F2937',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '15px',
              }}
            >
              🎥 Vídeo da aula
            </h2>

            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                overflow: 'hidden',
                borderRadius: '8px',
              }}
            >
              <iframe
                src={lesson.fileUrl}
                title={
                  lesson.title
                }
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          </div>
        )}

      {lessonContent && (
        <div
          style={{
            background: '#111827',
            border:
              '1px solid #1F2937',
            borderRadius: '10px',
            padding: '30px',
            marginBottom: '20px',
            lineHeight: '1.8',
          }}
          dangerouslySetInnerHTML={{
            __html:
              renderContent(
                lessonContent
              ),
          }}
        />
      )}

      {lesson.codeExample && (
        <div
          style={{
            background: '#0A1020',
            border:
              '1px solid #1F2937',
            borderLeft: `4px solid ${courseColor}`,
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              background: '#1F2937',
              padding: '10px 20px',
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily:
                  'monospace',
                fontSize: '13px',
                color: '#9CA3AF',
              }}
            >
              exemplo.
              {lesson.language ||
                'txt'}
            </span>

            <span
              style={{
                color: '#00FF88',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              💻 CÓDIGO
            </span>
          </div>

          <pre
            style={{
              padding: '20px',
              margin: 0,
              overflow: 'auto',
              fontSize: '13px',
              color: '#E5E7EB',
            }}
          >
            <code>
              {lesson.codeExample}
            </code>
          </pre>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          gap: '10px',
        }}
      >
        {previousLesson ? (
          <Link
            to={`/lesson/${course.slug}/${previousLesson.id}`}
            style={{
              padding: '12px 24px',
              background: '#1F2937',
              color: 'white',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            ← Anterior
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            to={`/lesson/${course.slug}/${nextLesson.id}`}
            style={{
              padding: '12px 24px',
              background: courseColor,
              color: 'black',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Próxima →
          </Link>
        ) : (
          <Link
            to="/galaxy"
            style={{
              padding: '12px 24px',
              background: '#FFD700',
              color: 'black',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            🎉 Finalizar Curso
          </Link>
        )}
      </div>
    </div>
  );
}