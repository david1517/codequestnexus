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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function convertLesson(value: unknown): Lesson {
  if (!isRecord(value)) {
    return {
      id: '',
      title: 'Aula sem título',
      type: 'pdf',
      content: '',
      xpReward: 0,
    };
  }

  let type: LessonType = 'pdf';

  if (value.type === 'word') type = 'word';
  else if (value.type === 'video') type = 'video';
  else if (value.type === 'quiz') type = 'quiz';

  return {
    id: typeof value.id === 'string' ? value.id : '',
    title: typeof value.title === 'string' ? value.title : 'Aula sem título',
    description: typeof value.description === 'string' ? value.description : '',
    type,
    content: typeof value.content === 'string' ? value.content : '',
    duration: typeof value.duration === 'number' ? value.duration : undefined,
    xpReward: typeof value.xpReward === 'number' ? value.xpReward : 0,
    language: typeof value.language === 'string' ? value.language : undefined,
    codeExample: typeof value.codeExample === 'string' ? value.codeExample : undefined,
    fileName: typeof value.fileName === 'string' ? value.fileName : undefined,
    fileUrl: typeof value.fileUrl === 'string' ? value.fileUrl : undefined,
    fileSize: typeof value.fileSize === 'number' ? value.fileSize : undefined,
    fileType: typeof value.fileType === 'string' ? value.fileType : undefined,
    uploadedAt: value.uploadedAt,
  };
}

function convertCourse(courseId: string, data: Record<string, unknown>): Course {
  const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug : courseId;
  const rawLessons: unknown[] = Array.isArray(data.lessons) ? data.lessons : [];

  return {
    id: courseId,
    slug,
    name: typeof data.name === 'string' ? data.name : 'Curso sem nome',
    description: typeof data.description === 'string' ? data.description : '',
    icon: typeof data.icon === 'string' ? data.icon : '🚀',
    color: typeof data.color === 'string' ? data.color : '#6366F1',
    planetName:
      typeof data.planetName === 'string'
        ? data.planetName
        : typeof data.name === 'string'
          ? data.name
          : 'Curso',
    teacherId: typeof data.teacherId === 'string' ? data.teacherId : '',
    lessons: rawLessons.map(convertLesson),
  };
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname.endsWith('.youtube.com')
    ) {
      const watchId = parsed.searchParams.get('v');
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
      if (parts[0] === 'shorts' && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName || 'material.docx';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function Lesson() {
  const { courseSlug, lessonId } = useParams<{
    courseSlug: string;
    lessonId: string;
  }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

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
        const coursesQuery = query(
          collection(firestore, 'courses'),
          where('published', '==', true)
        );
        const snapshot = await getDocs(coursesQuery);

        let selectedCourse: Course | null = null;

        for (const courseDoc of snapshot.docs) {
          const data = courseDoc.data();
          const possibleSlug =
            typeof data.slug === 'string' && data.slug.trim()
              ? data.slug
              : courseDoc.id;

          if (possibleSlug === courseSlug) {
            selectedCourse = convertCourse(courseDoc.id, data);
            break;
          }
        }

        if (cancelled) return;

        if (!selectedCourse) {
          setCourse(null);
          setLesson(null);
          setLoading(false);
          return;
        }

        const selectedLesson =
          selectedCourse.lessons.find((item) => item.id === lessonId) || null;

        setCourse(selectedCourse);
        setLesson(selectedLesson);
      } catch (error) {
        console.error('Erro ao carregar curso:', error);
        if (!cancelled) {
          setCourse(null);
          setLesson(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseSlug, lessonId]);

  const {
    completeLesson,
    uncompleteLesson,
    markAsDownloaded,
    isLessonCompleted,
    isLessonDownloaded,
  } = useProgress();

  const completed = lesson?.id ? isLessonCompleted(lesson.id) : false;
  const downloaded = lesson?.id ? isLessonDownloaded(lesson.id) : false;

  if (loading) {
    return (
      <div style={styles.center}>Carregando curso...</div>
    );
  }

  if (!course || !lesson) {
    return (
      <div style={styles.notFound}>
        <h2>Lição não encontrada</h2>
        <p>O curso ou a aula não foi encontrado no Firebase.</p>
        <Link to="/galaxy" style={styles.simpleLink}>Voltar à Galáxia</Link>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex((item) => item.id === lessonId);
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < course.lessons.length - 1
      ? course.lessons[currentIndex + 1]
      : null;

  const courseColor = course.color || '#6366F1';
  const lessonContent = lesson.content || '';
  const videoUrl = lesson.fileUrl?.trim() || '';
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);
  const iframeVideoUrl = youtubeEmbedUrl || videoUrl;

  const handleComplete = async () => {
    if (completed) {
      await uncompleteLesson(lesson.id, lesson.xpReward || 0);
      return;
    }

    await completeLesson(lesson.id, lesson.xpReward || 0);
  };

  const handleDownload = async () => {
    try {
      if (!downloaded) {
        await markAsDownloaded(lesson.id);
      }

      if (!lesson.fileUrl) return;

      if (lesson.type === 'word') {
        downloadDataUrl(lesson.fileUrl, lesson.fileName || 'material.docx');
      } else if (lesson.type === 'pdf') {
        downloadLessonPDF(lesson as any, course as any);
      }
    } catch (error) {
      console.error('Erro ao baixar material:', error);
    }
  };

  const renderContent = (markdown: string): string => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .split('\n\n')
      .map((block) => {
        if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<ul')) {
          return block;
        }
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
  };

  return (
    <div style={{ ...styles.page, maxWidth: 900 }}>
      <div style={styles.topBar}>
        <Link to="/galaxy" style={styles.simpleLink}>← Galáxia</Link>
        <span style={{ color: courseColor, fontWeight: 'bold' }}>
          {course.icon} {course.name}
        </span>
      </div>

      <div style={{ ...styles.hero, borderColor: courseColor, boxShadow: `0 0 30px ${courseColor}40` }}>
        <p style={{ ...styles.eyebrow, color: courseColor }}>
          {course.planetName} • Lição {currentIndex + 1} de {course.lessons.length}
        </p>
        <h1 style={styles.title}>{lesson.title}</h1>
        <p style={styles.description}>{lesson.description}</p>

        <div style={styles.meta}>
          {lesson.duration !== undefined && <span>⏱ {lesson.duration} min</span>}
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>⚡ +{lesson.xpReward || 0} XP</span>
          {lesson.language && <span>💻 {lesson.language}</span>}
          <span>
            {lesson.type === 'pdf' && '📄 PDF'}
            {lesson.type === 'word' && '📝 WORD'}
            {lesson.type === 'video' && '🎥 Vídeo'}
            {lesson.type === 'quiz' && '🧠 Quiz'}
          </span>
        </div>

        <div style={styles.actions}>
          <button onClick={handleComplete} style={{ ...styles.completeButton, background: completed ? '#00FF88' : courseColor }}>
            {completed ? '✓ COMPLETA (clique para desmarcar)' : '✓ Marcar como Completa'}
          </button>

          {(lesson.type === 'pdf' || lesson.type === 'word') && lesson.fileUrl && (
            <button onClick={handleDownload} style={styles.downloadButton}>
              {downloaded
                ? lesson.type === 'word'
                  ? '📝 Baixado - Baixar Word novamente'
                  : '📄 Baixado - Gerar PDF novamente'
                : lesson.type === 'word'
                  ? '📝 Baixar Word'
                  : '📄 Baixar PDF'}
            </button>
          )}
        </div>
      </div>

      {lesson.type === 'pdf' && lesson.fileUrl && (
        <div style={styles.materialCard}>
          <h2>📄 Material PDF</h2>
          <iframe src={lesson.fileUrl} title={lesson.fileName || lesson.title} style={styles.pdfFrame} />
        </div>
      )}

      {lesson.type === 'word' && lessonContent && (
        <div style={styles.wordMaterialCard}>
          <div style={styles.wordPageHeader}>
            <span style={styles.wordBadge}>📝 MINI WORD</span>
            <span style={styles.muted}>Conteúdo formatado pelo professor</span>
          </div>
          <div
            style={styles.wordPage}
            dangerouslySetInnerHTML={{ __html: lessonContent }}
          />
        </div>
      )}

      {lesson.type === 'word' && !lessonContent && (
        <div style={styles.materialCard}>
          <h2>📝 Material Word</h2>
          <p style={styles.muted}>Esta aula ainda não possui conteúdo.</p>
          {lesson.fileUrl && (
            <button onClick={handleDownload} style={{ ...styles.downloadButton, marginTop: 8 }}>
              📝 Baixar documento Word antigo
            </button>
          )}
        </div>
      )}

      {lesson.type === 'video' && lesson.fileUrl && (
        <div style={styles.materialCard}>
          <h2>🎥 Vídeo da aula</h2>
          <div style={styles.videoWrapper}>
            {iframeVideoUrl ? (
              <iframe
                src={iframeVideoUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={styles.videoFrame}
              />
            ) : null}
          </div>
          {!youtubeEmbedUrl && (
            <a href={lesson.fileUrl} target="_blank" rel="noreferrer" style={{ ...styles.simpleLink, display: 'inline-block', marginTop: 12 }}>
              ▶️ Abrir vídeo em outra aba
            </a>
          )}
        </div>
      )}

      {lessonContent && lesson.type !== 'word' && (
        <div style={styles.content} dangerouslySetInnerHTML={{ __html: renderContent(lessonContent) }} />
      )}

      {lesson.codeExample && (
        <div style={styles.codeCard}>
          <div style={styles.codeHeader}>
            <span style={styles.codeLanguage}>exemplo.{lesson.language || 'txt'}</span>
            <span style={styles.codeBadge}>💻 CÓDIGO</span>
          </div>
          <pre style={styles.code}><code>{lesson.codeExample}</code></pre>
        </div>
      )}

      <div style={styles.navigation}>
        {previousLesson ? (
          <Link to={`/lesson/${course.slug}/${previousLesson.id}`} style={styles.navButton}>← Anterior</Link>
        ) : <div />}

        {nextLesson ? (
          <Link to={`/lesson/${course.slug}/${nextLesson.id}`} style={{ ...styles.navButton, background: courseColor, color: '#000' }}>Próxima →</Link>
        ) : (
          <Link to="/galaxy" style={{ ...styles.navButton, background: '#FFD700', color: '#000' }}>🎉 Finalizar Curso</Link>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 20,
    color: 'white',
    fontFamily: 'sans-serif',
    margin: '0 auto',
    minHeight: '100vh',
  },
  center: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 18,
  },
  notFound: {
    padding: 40,
    color: 'white',
    textAlign: 'center',
  },
  simpleLink: {
    color: '#00D4FF',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
    flexWrap: 'wrap',
  },
  hero: {
    background: '#111827',
    border: '2px solid',
    borderRadius: 10,
    padding: 30,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  description: {
    color: '#9CA3AF',
    marginTop: 10,
  },
  meta: {
    display: 'flex',
    gap: 20,
    marginTop: 15,
    fontSize: 13,
    color: '#9CA3AF',
    flexWrap: 'wrap',
  },
  actions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  completeButton: {
    padding: '12px 24px',
    color: 'black',
    border: 'none',
    borderRadius: 5,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 14,
  },
  downloadButton: {
    padding: '12px 24px',
    background: 'transparent',
    color: 'white',
    border: '1px solid #8B5CF6',
    borderRadius: 5,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 14,
  },
  materialCard: {
    background: '#111827',
    border: '1px solid #1F2937',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  muted: {
    color: '#9CA3AF',
    lineHeight: 1.6,
  },
  pdfFrame: {
    width: '100%',
    height: 700,
    border: 'none',
    borderRadius: 8,
    background: 'white',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  videoFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  content: {
    background: '#111827',
    border: '1px solid #1F2937',
    borderRadius: 10,
    padding: 30,
    marginBottom: 20,
    lineHeight: 1.8,
  },
  codeCard: {
    background: '#0A1020',
    border: '1px solid #1F2937',
    borderLeft: '4px solid #6366F1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  codeHeader: {
    background: '#1F2937',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLanguage: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#9CA3AF',
  },
  codeBadge: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: 'bold',
  },
  code: {
    padding: 20,
    margin: 0,
    overflow: 'auto',
    fontSize: 13,
    color: '#E5E7EB',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 40,
  },
  navButton: {
    padding: '12px 24px',
    background: '#1F2937',
    color: 'white',
    borderRadius: 5,
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  wordMaterialCard: {
    background: '#D1D5DB',
    border: '1px solid #374151',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  wordPageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    padding: '0 4px 12px',
  },
  wordBadge: {
    background: '#111827',
    color: '#FFFFFF',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  wordPage: {
    background: '#FFFFFF',
    color: '#111827',
    minHeight: 420,
    padding: '42px 48px',
    borderRadius: 6,
    boxShadow: '0 8px 30px rgba(0,0,0,0.16)',
    lineHeight: 1.7,
    overflowX: 'auto',
  },
};
