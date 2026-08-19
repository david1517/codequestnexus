import { useProgress } from '@/hooks/useProgress';
import { MISSIONS } from '@/data/missions';
import { useEffect, useState } from 'react';

export function Missions() {
  const { progress, isLessonCompleted } = useProgress();
  const [missions, setMissions] = useState(MISSIONS);

  useEffect(() => {
    // Atualiza progresso das missoes baseado no progresso real
    setMissions((prev) =>
      prev.map((m) => {
        let progressValue = 0;
        if (m.id === 'm1') progressValue = progress.completedLessons.length;
        if (m.id === 'm2') progressValue = progress.completedLessons.length;
        if (m.id === 'm3') {
          const uniqueCourses = new Set(
            progress.completedLessons.map((id) => id.split('-')[0])
          );
          progressValue = uniqueCourses.size;
        }
        if (m.id === 'm4') progressValue = progress.xp;
        if (m.id === 'm5') progressValue = progress.downloadedLessons.length;
        if (m.id === 'm6') progressValue = progress.completedLessons.length >= 1 ? 1 : 0;
        if (m.id === 'm7') {
          const uniqueCourses = new Set(
            progress.completedLessons.map((id) => id.split('-')[0])
          );
          progressValue = uniqueCourses.size;
        }
        return {
          ...m,
          progress: Math.min(progressValue, m.target),
          completed: progressValue >= m.target,
        };
      })
    );
  }, [progress]);

  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const weeklyMissions = missions.filter((m) => m.type === 'weekly');
  const storyMissions = missions.filter((m) => m.type === 'story');

  const MissionCard = ({ mission }: { mission: typeof MISSIONS[0] }) => {
    const percent = (mission.progress / mission.target) * 100;
    return (
      <div
        style={{
          background: '#111827',
          border: mission.completed ? '1px solid #00FF88' : '1px solid #1F2937',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '15px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{mission.title}</h3>
              {mission.completed && (
                <span
                  style={{
                    background: '#00FF88',
                    color: 'black',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  COMPLETA
                </span>
              )}
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '5px' }}>
              {mission.description}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold' }}>
              +{mission.xpReward}
            </p>
            <p style={{ color: '#6B7280', fontSize: '10px' }}>XP</p>
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#9CA3AF',
              marginBottom: '5px',
            }}
          >
            <span>Progresso</span>
            <span>
              {mission.progress} / {mission.target}
            </span>
          </div>
          <div
            style={{
              background: '#1F2937',
              borderRadius: '10px',
              height: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: mission.completed
                  ? 'linear-gradient(90deg, #00FF88, #10B981)'
                  : 'linear-gradient(90deg, #00D4FF, #8B5CF6)',
                height: '100%',
                width: `${percent}%`,
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
          🎯 Missoes
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          Complete missoes para ganhar XP e desbloquear recompensas
        </p>
      </div>

      {dailyMissions.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#00D4FF' }}>
            📅 Diaria
          </h2>
          {dailyMissions.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </section>
      )}

      {weeklyMissions.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#8B5CF6' }}>
            📆 Semanal
          </h2>
          {weeklyMissions.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </section>
      )}

      {storyMissions.length > 0 && (
        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#FFD700' }}>
            📖 Historia
          </h2>
          {storyMissions.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </section>
      )}
    </div>
  );
}
