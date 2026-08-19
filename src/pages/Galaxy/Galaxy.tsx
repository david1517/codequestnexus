import { Link } from 'react-router-dom';
import { getAllCourses } from '@/data/courses';
import { useProgress } from '@/hooks/useProgress';
import { useState } from 'react';

export function Galaxy() {
  const courses = getAllCourses();
  const { getCourseProgress, isLessonCompleted } = useProgress();
  const [filter, setFilter] = useState<'all' | 'Iniciante' | 'Intermediário' | 'Avançado'>('all');

  const filteredCourses = filter === 'all'
    ? courses
    : courses.filter((c) => c.level === filter);

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
          🌌 Galaxia de Cursos
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          Explore 10 planetas e domine as linguagens do futuro
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              background: filter === f ? '#00D4FF' : '#1F2937',
              color: filter === f ? 'black' : 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            {f === 'all' ? 'Todos' : f}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredCourses.map((course) => {
          const progressPercent = getCourseProgress(course.slug, course.totalLessons);
          const firstLessonId = course.lessons[0]?.id;
          const isFirstDone = firstLessonId ? isLessonCompleted(firstLessonId) : false;
          const locked = course.requiredLevel > 1;

          return (
            <Link
              key={course.id}
              to={locked ? '#' : `/lesson/${course.slug}/${firstLessonId}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: '#111827',
                  border: `2px solid ${course.color}40`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => !locked && (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${course.color}40, ${course.color}10)`,
                    padding: '30px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '50px' }}>{course.icon}</div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: course.color, fontSize: '20px', fontWeight: 'bold' }}>
                      {course.name}
                    </h3>
                    {isFirstDone && <span style={{ color: '#00FF88' }}>✓</span>}
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
                    {course.planetName}
                  </p>
                  <p style={{ color: '#D1D5DB', fontSize: '14px', marginTop: '10px' }}>
                    {course.description}
                  </p>

                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', fontSize: '12px', color: '#9CA3AF' }}>
                    <span>📚 {course.totalLessons} licoes</span>
                    <span>⚡ {course.totalXp} XP</span>
                  </div>

                  {progressPercent > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '5px' }}>
                        Progresso: {progressPercent}%
                      </div>
                      <div
                        style={{
                          background: '#1F2937',
                          borderRadius: '10px',
                          height: '6px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            background: course.color,
                            height: '100%',
                            width: `${progressPercent}%`,
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {locked && (
                    <div
                      style={{
                        marginTop: '15px',
                        padding: '8px',
                        background: '#1F2937',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#FFD700',
                      }}
                    >
                      🔒 Bloqueado (nivel {course.requiredLevel})
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
