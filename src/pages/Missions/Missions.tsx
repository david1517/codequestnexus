import { useEffect, useState } from 'react';
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
          {progress?.completedLessons ?? 0} aulas concluídas
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '15px',
        }}
      >
        {missions.map((mission) => (
          <div
            key={mission.id}
            style={{
              background: '#111827',
              border: '1px solid #1F2937',
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
                  width: `${Math.min(
                    (mission.progress /
                      mission.target) *
                      100,
                    100
                  )}%`,
                  height: '100%',
                  background: '#00D4FF',
                }}
              />
            </div>

            <p
              style={{
                color: '#9CA3AF',
                fontSize: '13px',
                marginBottom: 0,
              }}
            >
              {mission.progress} / {mission.target}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}