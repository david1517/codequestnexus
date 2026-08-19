import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useState, useEffect } from 'react';
import { getAllCourses } from '@/data/courses';

const STORAGE_KEY = 'codequest-progress-direct';

interface Progress {
  completedLessons: string[];
  xp: number;
  downloadedLessons: string[];
  lastUpdated?: string;
}

export function Profile() {
  const { user, logout } = useAuthStore();
  const [progress, setProgress] = useState<Progress>({
    completedLessons: [],
    xp: 0,
    downloadedLessons: [],
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProgress({
          completedLessons: data.completedLessons || [],
          xp: data.xp || 0,
          downloadedLessons: data.downloadedLessons || [],
          lastUpdated: data.lastUpdated,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recarrega quando volta pra página
  useEffect(() => {
    const handleFocus = () => loadProgress();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleReset = () => {
    if (window.confirm('⚠️ Apagar TODO o seu progresso?')) {
      localStorage.removeItem(STORAGE_KEY);
      setProgress({ completedLessons: [], xp: 0, downloadedLessons: [] });
      alert('✅ Progresso resetado!');
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  const totalCompleted = progress.completedLessons.length;
  const totalDownloaded = progress.downloadedLessons.length;
  const allCourses = getAllCourses();
  const startedCourseSlugs = Array.from(
    new Set(progress.completedLessons.map((id) => id.split('-')[0]))
  );
  const coursesStarted = allCourses.filter((c) => startedCourseSlugs.includes(c.slug));

  // Calcular nível
  const xpForLevel = (lvl: number) => 100 * Math.pow(lvl, 1.5);
  let currentLevel = 1;
  let totalXpNeeded = 0;
  for (let i = 1; i <= 100; i++) {
    const needed = xpForLevel(i);
    if (progress.xp >= totalXpNeeded + needed) {
      totalXpNeeded += needed;
      currentLevel = i + 1;
    } else break;
  }
  const xpInCurrentLevel = progress.xp - totalXpNeeded;
  const xpToNextLevel = xpForLevel(currentLevel);
  const levelProgressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;

  const getCourseProgress = (slug: string, total: number) => {
    const done = progress.completedLessons.filter((id) => id.startsWith(`${slug}-`)).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif', maxWidth: '1200px' }}>
      
      {/* CARD PRINCIPAL */}
      <div
        style={{
          background: '#111827',
          border: '2px solid #00D4FF',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 30px #00D4FF80',
          }}
        >
          <span style={{ fontSize: '10px', color: '#E5E7EB' }}>NÍVEL</span>
          <span style={{ fontSize: '36px', fontWeight: 'bold' }}>{currentLevel}</span>
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            {user.username}
          </h1>
          <p style={{ color: '#FFD700', fontSize: '14px', marginBottom: '5px' }}>⭐ {user.title}</p>
          <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '15px' }}>{user.email}</p>

          <div style={{ marginBottom: '10px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#9CA3AF',
                marginBottom: '5px',
              }}
            >
              <span>Progresso para o nível {currentLevel + 1}</span>
              <span>
                {Math.floor(xpInCurrentLevel)} / {Math.floor(xpToNextLevel)} XP
              </span>
            </div>
            <div
              style={{
                background: '#1F2937',
                borderRadius: '10px',
                height: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(90deg, #00D4FF, #8B5CF6)',
                  height: '100%',
                  width: `${Math.min(levelProgressPercent, 100)}%`,
                  transition: 'width 0.5s',
                }}
              />
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            🚪 Sair
          </button>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#111827', border: '1px solid #00D4FF40', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>⚡</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00D4FF' }}>{progress.xp}</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>XP Total</div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #00FF8840', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>✓</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00FF88' }}>{totalCompleted}</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Lições Completas</div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #8B5CF640', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>📄</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B5CF6' }}>{totalDownloaded}</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>PDFs Baixados</div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #FFD70040', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>🚀</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFD700' }}>{coursesStarted.length}</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Cursos Ativos</div>
        </div>
      </div>

      {/* MEUS CURSOS */}
      <div
        style={{
          background: '#111827',
          border: '1px solid #1F2937',
          borderRadius: '10px',
          padding: '25px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>📚 Meus Cursos</h2>
          <Link
            to="/galaxy"
            style={{
              padding: '8px 16px',
              background: '#00D4FF',
              color: 'black',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            Ver mais →
          </Link>
        </div>

        {coursesStarted.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              border: '2px dashed #1F2937',
              borderRadius: '10px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌌</div>
            <p style={{ color: '#9CA3AF', marginBottom: '15px' }}>
              Você ainda não completou nenhuma lição
            </p>
            <Link
              to="/galaxy"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#00D4FF',
                color: 'black',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Explorar Galáxia
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {coursesStarted.map((course) => {
              const percent = getCourseProgress(course.slug, course.totalLessons);
              const lessonsDone = progress.completedLessons.filter((id) =>
                id.startsWith(`${course.slug}-`)
              ).length;

              return (
                <Link
                  key={course.id}
                  to={`/lesson/${course.slug}/${course.lessons[0]?.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#0A1020',
                      border: '1px solid #1F2937',
                      borderLeft: `4px solid ${course.color}`,
                      borderRadius: '8px',
                      padding: '15px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(5px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '30px' }}>{course.icon}</div>
                        <div>
                          <h3 style={{ fontWeight: 'bold', color: course.color, fontSize: '16px' }}>
                            {course.name}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {lessonsDone} de {course.totalLessons} lições
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          background: `${course.color}20`,
                          color: course.color,
                          padding: '4px 10px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: `1px solid ${course.color}`,
                        }}
                      >
                        {percent}%
                      </div>
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
                          width: `${percent}%`,
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ZONA DE PERIGO */}
      <div
        style={{
          background: '#111827',
          border: '1px solid #ef4444',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <h3 style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>⚠️ Zona de Perigo</h3>
        <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '5px', marginBottom: '10px' }}>
          Resetar todo o progresso, XP e downloads.
        </p>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          🗑️ Resetar Progresso
        </button>
      </div>
    </div>
  );
}
