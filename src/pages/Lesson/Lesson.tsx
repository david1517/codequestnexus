import { useParams, Link } from 'react-router-dom';
import { getCourseBySlug } from '@/data/courses';
import { useState, useEffect } from 'react';
import { downloadLessonPDF } from '@/utils/pdfGenerator';

const STORAGE_KEY = 'codequest-progress-direct';

export function Lesson() {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId: string }>();
  const [completed, setCompleted] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const course = courseSlug ? getCourseBySlug(courseSlug) : undefined;
  const lesson = course?.lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    if (!lesson) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setCompleted(data.completedLessons?.includes(lesson.id) || false);
        setDownloaded(data.downloadedLessons?.includes(lesson.id) || false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [lesson?.id]);

  if (!course || !lesson) {
    return (
      <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
        <h2>Lição não encontrada</h2>
        <Link to="/galaxy" style={{ color: '#00D4FF' }}>Voltar à Galáxia</Link>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  const saveProgress = (newData: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let current = stored
        ? JSON.parse(stored)
        : { completedLessons: [], xp: 0, downloadedLessons: [] };

      if (completed) {
        current = {
          ...current,
          completedLessons: current.completedLessons.filter((id: string) => id !== lesson.id),
          xp: Math.max(0, current.xp - lesson.xpReward),
        };
        setCompleted(false);
      } else {
        current = {
          ...current,
          completedLessons: [...current.completedLessons, lesson.id],
          xp: current.xp + lesson.xpReward,
        };
        setCompleted(true);
      }

      saveProgress(current);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let current = stored
        ? JSON.parse(stored)
        : { completedLessons: [], xp: 0, downloadedLessons: [] };

      if (!downloaded) {
        current = {
          ...current,
          downloadedLessons: [...current.downloadedLessons, lesson.id],
        };
        saveProgress(current);
        setDownloaded(true);
      }

      downloadLessonPDF(lesson, course);
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = (markdown: string) => {
    let html = markdown
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
        if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<ul')) return block;
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
    return html;
  };

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link to="/galaxy" style={{ color: '#00D4FF', textDecoration: 'none', fontWeight: 'bold' }}>← Galáxia</Link>
        <span style={{ color: course.color, fontWeight: 'bold' }}>
          {course.icon} {course.name}
        </span>
      </div>

      <div
        style={{
          background: '#111827',
          border: `2px solid ${course.color}`,
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: `0 0 30px ${course.color}40`,
        }}
      >
        <p style={{ color: course.color, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
          {course.planetName} • Lição {currentIndex + 1} de {course.lessons.length}
        </p>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>{lesson.title}</h1>
        <p style={{ color: '#9CA3AF', marginTop: '10px' }}>{lesson.description}</p>

        <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '13px', color: '#9CA3AF', flexWrap: 'wrap' }}>
          <span>⏱ {lesson.duration} min</span>
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>⚡ +{lesson.xpReward} XP</span>
          <span>💻 {lesson.language}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={handleComplete}
            style={{
              padding: '12px 24px',
              background: completed ? '#00FF88' : course.color,
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {completed ? '✓ COMPLETA (clique para desmarcar)' : '✓ Marcar como Completa'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: 'white',
              border: '1px solid #8B5CF6',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {downloaded ? '📄 Baixado - Gerar PDF' : '📄 Baixar PDF'}
          </button>
        </div>
      </div>

      <div
        style={{
          background: '#111827',
          border: '1px solid #1F2937',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '20px',
          lineHeight: '1.8',
        }}
        dangerouslySetInnerHTML={{ __html: renderContent(lesson.content) }}
      />

      {lesson.codeExample && (
        <div
          style={{
            background: '#0A1020',
            border: '1px solid #1F2937',
            borderLeft: `4px solid ${course.color}`,
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
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#9CA3AF' }}>
              exemplo.{lesson.language}
            </span>
            <span style={{ color: '#00FF88', fontSize: '12px', fontWeight: 'bold' }}>💻 CÓDIGO</span>
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
            <code>{lesson.codeExample}</code>
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
        ) : <div />}

        {nextLesson ? (
          <Link
            to={`/lesson/${course.slug}/${nextLesson.id}`}
            style={{
              padding: '12px 24px',
              background: course.color,
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
