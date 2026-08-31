import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useState, useEffect } from 'react';
import { getAllCourses } from '@/data/courses';
import { MISSIONS } from '@/data/missions';
import { ACHIEVEMENTS } from '@/data/achievements';

const STORAGE_KEY = 'codequest-progress-direct';

export function Dashboard() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState({
    completedLessons: [] as string[],
    xp: 0,
    downloadedLessons: [] as string[],
  });

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProgress({
          completedLessons: data.completedLessons || [],
          xp: data.xp || 0,
          downloadedLessons: data.downloadedLessons || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  // Recarrega quando volta pra página
  useEffect(() => {
    const handleFocus = () => loadProgress();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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

  // Cálculos de nível
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

  // Missões dinâmicas
  const dailyMissions = MISSIONS.filter((m) => m.type === 'daily').map((m) => {
    let prog = 0;
    if (m.id === 'm1' || m.id === 'm2') prog = totalCompleted;
    if (m.id === 'm3')
      prog = new Set(progress.completedLessons.map((id) => id.split('-')[0])).size;
    return { ...m, progress: Math.min(prog, m.target), completed: prog >= m.target };
  });

  // Conquistas dinâmicas
  const recentAchievements = ACHIEVEMENTS.slice(0, 4).map((a) => {
    let currentValue = 0;
    if (a.criteria.type === 'lessons_completed') currentValue = totalCompleted;
    if (a.criteria.type === 'xp_earned') currentValue = progress.xp;
    if (a.criteria.type === 'downloads') currentValue = totalDownloaded;
    return { ...a, unlocked: currentValue >= a.criteria.target };
  });

  // Cursos em progresso
  const coursesInProgress = allCourses
    .map((c) => ({
      ...c,
      percent: (() => {
        const done = progress.completedLessons.filter((id) =>
          id.startsWith(`${c.slug}-`)
        ).length;
        return c.totalLessons > 0 ? Math.round((done / c.totalLessons) * 100) : 0;
      })(),
    }))
    .filter((c) => c.percent > 0 && c.percent < 100)
    .slice(0, 3);

  // Próxima lição
  const nextLesson = (() => {
    for (const course of allCourses) {
      const next = course.lessons.find((l) => !progress.completedLessons.includes(l.id));
      if (next) return { course, lesson: next };
    }
    return null;
  })();

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>
          Bem-vindo, <span style={{ color: '#00D4FF' }}>{user.username}</span>!
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '5px' }}>
          {user.title} • Nível {currentLevel}
        </p>
      </div>

      {/* ESTATÍSTICAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '15px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            background: '#111827',
            border: '1px solid #00D4FF40',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '24px' }}>⚡</div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '12px' }}>XP Total</p>
              <p style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                {progress.xp.toLocaleString()}
              </p>
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
                background: 'linear-gradient(90deg, #00D4FF, #8B5CF6)',
                height: '100%',
                width: `${Math.min(levelProgressPercent, 100)}%`,
              }}
            />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '5px' }}>
            {Math.floor(xpInCurrentLevel)} / {Math.floor(xpToNextLevel)} para o nível {currentLevel + 1}
          </p>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid #00FF8840',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <div style={{ fontSize: '40px' }}>✓</div>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>Lições Completas</p>
            <p style={{ color: '#00FF88', fontSize: '28px', fontWeight: 'bold' }}>{totalCompleted}</p>
          </div>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid #8B5CF640',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <div style={{ fontSize: '40px' }}>📄</div>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>PDFs Baixados</p>
            <p style={{ color: '#8B5CF6', fontSize: '28px', fontWeight: 'bold' }}>{totalDownloaded}</p>
          </div>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid #FFD70040',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <div style={{ fontSize: '40px' }}>🚀</div>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>Cursos Ativos</p>
            <p style={{ color: '#FFD700', fontSize: '28px', fontWeight: 'bold' }}>
              {new Set(progress.completedLessons.map((id) => id.split('-')[0])).size}
            </p>
          </div>
        </div>
      </div>

      {/* CONTINUE APRENDENDO */}
      {nextLesson && (
        <div
          style={{
            background: '#111827',
            border: `2px solid ${nextLesson.course.color}`,
            borderRadius: '10px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: `0 0 30px ${nextLesson.course.color}40`,
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
            ⚡ Continue Aprendendo
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '50px' }}>{nextLesson.course.icon}</div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ color: nextLesson.course.color, fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {nextLesson.course.name}
              </p>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>
                {nextLesson.lesson.title}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '5px' }}>
                {nextLesson.lesson.description}
              </p>
            </div>
            <Link
              to={`/lesson/${nextLesson.course.slug}/${nextLesson.lesson.id}`}
              style={{
                padding: '12px 24px',
                background: nextLesson.course.color,
                color: 'black',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Continuar →
            </Link>
          </div>
        </div>
      )}

      {/* GRID DE CONTEÚDO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {/* MISSÕES */}
        <div
          style={{
            background: '#111827',
            border: '1px solid #1F2937',
            borderRadius: '10px',
            padding: '25px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>🎯 Missões Diárias</h2>
            <Link to="/missions" style={{ color: '#00D4FF', fontSize: '12px', textDecoration: 'none' }}>
              Ver todas →
            </Link>
          </div>

          {dailyMissions.slice(0, 3).map((m) => {
            const percent = (m.progress / m.target) * 100;
            return (
              <div
                key={m.id}
                style={{
                  padding: '12px',
                  background: '#0A1020',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: m.completed ? '1px solid #00FF88' : '1px solid #1F2937',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{m.title}</p>
                  <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>
                    +{m.xpReward} XP
                  </span>
                </div>
                <div
                  style={{
                    background: '#1F2937',
                    borderRadius: '10px',
                    height: '5px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: m.completed
                        ? 'linear-gradient(90deg, #00FF88, #10B981)'
                        : 'linear-gradient(90deg, #00D4FF, #8B5CF6)',
                      height: '100%',
                      width: `${percent}%`,
                    }}
                  />
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '5px' }}>
                  {m.progress}/{m.target}
                </p>
              </div>
            );
          })}
        </div>

        {/* CONQUISTAS */}
        <div
          style={{
            background: '#111827',
            border: '1px solid #1F2937',
            borderRadius: '10px',
            padding: '25px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>🏆 Conquistas</h2>
            <Link to="/achievements" style={{ color: '#FFD700', fontSize: '12px', textDecoration: 'none' }}>
              Ver todas →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {recentAchievements.map((a) => (
              <div
                key={a.id}
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  background: '#0A1020',
                  borderRadius: '8px',
                  opacity: a.unlocked ? 1 : 0.4,
                }}
              >
                <div style={{ fontSize: '30px' }}>{a.unlocked ? a.icon : '🔒'}</div>
                <p style={{ fontSize: '10px', marginTop: '5px', color: '#9CA3AF' }}>{a.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CURSOS EM PROGRESSO */}
        {coursesInProgress.length > 0 && (
          <div
            style={{
              background: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '10px',
              padding: '25px',
              gridColumn: 'span 2',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>📚 Cursos em Progresso</h2>
              <Link to="/galaxy" style={{ color: '#00D4FF', fontSize: '12px', textDecoration: 'none' }}>
                Ver mais →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
              }}
            >
              {coursesInProgress.map((course) => (
                <Link
                  key={course.id}
                  to={`/lesson/${course.slug}/${course.lessons[0]?.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#0A1020',
                      border: `1px solid ${course.color}40`,
                      borderRadius: '8px',
                      padding: '15px',
                    }}
                  >
                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>{course.icon}</div>
                    <h3 style={{ color: course.color, fontWeight: 'bold', fontSize: '14px' }}>
                      {course.name}
                    </h3>
                    <div
                      style={{
                        background: '#1F2937',
                        borderRadius: '10px',
                        height: '5px',
                        overflow: 'hidden',
                        marginTop: '10px',
                      }}
                    >
                      <div
                        style={{
                          background: course.color,
                          height: '100%',
                          width: `${course.percent}%`,
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>
                      {course.percent}% completo
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
