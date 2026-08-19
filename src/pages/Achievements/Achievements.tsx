import { ACHIEVEMENTS, type Rarity } from '@/data/achievements';
import { useProgress } from '@/hooks/useProgress';
import { useState } from 'react';

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#FFD700',
  mythic: '#FF0080',
};

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Lendario',
  mythic: 'Mitico',
};

export function Achievements() {
  const { progress } = useProgress();
  const [filter, setFilter] = useState<'all' | Rarity>('all');

  // Verifica quais achievements foram desbloqueadas
  const achievementsWithStatus = ACHIEVEMENTS.map((a) => {
    let currentValue = 0;
    if (a.criteria.type === 'lessons_completed') currentValue = progress.completedLessons.length;
    if (a.criteria.type === 'xp_earned') currentValue = progress.xp;
    if (a.criteria.type === 'downloads') currentValue = progress.downloadedLessons.length;
    if (a.criteria.type === 'courses_completed') {
      const uniqueCourses = new Set(
        progress.completedLessons.map((id) => id.split('-')[0])
      );
      currentValue = uniqueCourses.size;
    }
    return {
      ...a,
      unlocked: currentValue >= a.criteria.target,
      progress: currentValue,
    };
  });

  const filtered = filter === 'all'
    ? achievementsWithStatus
    : achievementsWithStatus.filter((a) => a.rarity === filter);

  const unlockedCount = achievementsWithStatus.filter((a) => a.unlocked).length;

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
          🏆 Conquistas
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          {unlockedCount} de {ACHIEVEMENTS.length} desbloqueadas
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {(['all', 'common', 'rare', 'epic', 'legendary', 'mythic'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              background: filter === f ? '#FFD700' : '#1F2937',
              color: filter === f ? 'black' : 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              textTransform: 'uppercase',
            }}
          >
            {f === 'all' ? 'Todas' : RARITY_LABELS[f as Rarity]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {filtered.map((achievement) => {
          const color = RARITY_COLORS[achievement.rarity];
          return (
            <div
              key={achievement.id}
              style={{
                background: '#111827',
                border: `2px solid ${achievement.unlocked ? color : '#1F2937'}`,
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                opacity: achievement.unlocked ? 1 : 0.4,
                filter: achievement.unlocked ? 'none' : 'grayscale(80%)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div
                style={{
                  fontSize: '50px',
                  marginBottom: '10px',
                  filter: achievement.unlocked ? 'none' : 'blur(2px)',
                }}
              >
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>

              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: achievement.unlocked ? color : '#6B7280',
                  marginBottom: '5px',
                }}
              >
                {achievement.name}
              </h3>

              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '10px' }}>
                {achievement.description}
              </p>

              <div
                style={{
                  display: 'inline-block',
                  background: `${color}20`,
                  color: color,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  border: `1px solid ${color}`,
                }}
              >
                {RARITY_LABELS[achievement.rarity]}
              </div>

              <div
                style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: '#FFD700',
                  fontWeight: 'bold',
                }}
              >
                +{achievement.xpReward} XP
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
