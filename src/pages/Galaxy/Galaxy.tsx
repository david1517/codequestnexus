import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlanets } from '@/lib/mockApi';
import type { Planet } from '@/types';

export function Galaxy() {
  const [courses, setCourses] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getPlanets();
        setCourses(data);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

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
        Carregando galáxia...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '30px',
        color: 'white',
      }}
    >
      <div
        style={{
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          🌌 Galáxia
        </h1>

        <p
          style={{
            color: '#9CA3AF',
            marginTop: '8px',
          }}
        >
          Escolha um planeta para começar sua jornada.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {courses.map((course) => {
          const locked = course.requiredLevel > 1;

          return (
            <div
              key={course.id}
              style={{
                background: '#111827',
                border: `1px solid ${course.color}`,
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                opacity: locked ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  fontSize: '42px',
                  marginBottom: '15px',
                }}
              >
                {course.icon}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '22px',
                }}
              >
                {course.planetName}
              </h2>

              <p
                style={{
                  color: '#9CA3AF',
                  lineHeight: 1.5,
                }}
              >
                {course.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '15px',
                  color: '#D1D5DB',
                  fontSize: '13px',
                }}
              >
                <span>
                  {course.completedLessons}/
                  {course.totalLessons} aulas
                </span>

                <span>
                  {course.progress}%
                </span>
              </div>

              <div
                style={{
                  height: '6px',
                  background: '#1F2937',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    width: `${course.progress}%`,
                    height: '100%',
                    background: course.color,
                  }}
                />
              </div>

              {locked ? (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#1F2937',
                    color: '#9CA3AF',
                    textAlign: 'center',
                  }}
                >
                  🔒 Bloqueado — nível {course.requiredLevel}
                </div>
              ) : (
                <Link
                  to={`/lesson/${course.slug}/1`}
                  style={{
                    display: 'block',
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: course.color,
                    color: '#000',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  🚀 Entrar no curso
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}