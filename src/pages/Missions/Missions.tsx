import { useEffect, useMemo, useState } from 'react';
import { getMissions } from '@/lib/mockApi';
import { useProgress } from '@/hooks/useProgress';
import type { Mission } from '@/types';

export function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const { progress } = useProgress();

  useEffect(() => {
    async function loadMissions() {
      try {
        const data = await getMissions();
        setMissions(data);
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, []);

  /*
   * O mockApi possui valores iniciais fixos para as missões.
   * Aqui usamos o progresso REAL do aluno.
   */
  const missionsWithProgress = useMemo(() => {
    const completedLessons =
      progress?.completedLessons?.length ?? 0;

    return missions.map((mission) => {
      let currentProgress = mission.progress;

      /*
       * mission-1:
       * Complete sua primeira aula.
       */
      if (mission.id === 'mission-1') {
        currentProgress = Math.min(
          completedLessons,
          mission.target
        );
      }

      /*
       * mission-2:
       * Complete 3 aulas.
       */
      if (mission.id === 'mission-2') {
        currentProgress = Math.min(
          completedLessons,
          mission.target
        );
      }

      return {
        ...mission,
        progress: currentProgress,
        completed:
          currentProgress >= mission.target,
      };
    });
  }, [missions, progress?.completedLessons]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        Carregando missões...
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
      <div style={{ marginBottom: '30px' }}>
        <h1
          style={{
            fontSize: '32px',
            margin: 0,
          }}
        >
          🎯 Missões
        </h1>

        <p
          style={{
            color: '#9CA3AF',
            marginTop: '8px',
          }}
        >
          Complete missões para ganhar XP.
        </p>
      </div>

      <div
        style={{
          marginBottom: '25px',
          padding: '20px',
          background: '#111827',
          borderRadius: '12px',
          border: '1px solid #1F2937',
        }}
      >
        <strong>Progresso das aulas</strong>

        <p
          style={{
            color: '#9CA3AF',
            marginBottom: 0,
          }}
        >
          {progress?.completedLessons?.length ?? 0}{' '}
          aulas concluídas
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '15px',
        }}
      >
        {missionsWithProgress.map((mission) => {
          const percentage =
            mission.target > 0
              ? Math.min(
                  (mission.progress / mission.target) * 100,
                  100
                )
              : 0;

          return (
            <div
              key={mission.id}
              style={{
                background: '#111827',
                border:
                  mission.completed
                    ? '1px solid #22C55E'
                    : '1px solid #1F2937',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '18px',
                    }}
                  >
                    {mission.title}
                  </h2>

                  <p
                    style={{
                      color: '#9CA3AF',
                    }}
                  >
                    {mission.description}
                  </p>
                </div>

                <strong
                  style={{
                    color: '#00D4FF',
                  }}
                >
                  +{mission.xpReward} XP
                </strong>
              </div>

              <div
                style={{
                  marginTop: '15px',
                  height: '8px',
                  background: '#1F2937',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: '#00D4FF',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <p
                  style={{
                    color: '#9CA3AF',
                    fontSize: '13px',
                    margin: 0,
                  }}
                >
                  {mission.progress} / {mission.target}
                </p>

                {mission.completed && (
                  <strong
                    style={{
                      color: '#22C55E',
                      fontSize: '13px',
                    }}
                  >
                    ✓ Concluída
                  </strong>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
