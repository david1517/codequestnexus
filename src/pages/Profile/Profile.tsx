import { useAuthStore } from '@/stores/useAuthStore';

export function Profile() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const xpForNextLevel =
    user.level * 1000;

  const xpProgress = Math.min(
    100,
    Math.round(
      (user.xp / xpForNextLevel) * 100
    )
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '30px',
        color: 'white',
        fontFamily: 'sans-serif',
        background:
          'radial-gradient(circle at top right, #182447 0%, #080D19 50%, #050811 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            background:
              'linear-gradient(135deg, #111827, #10172A)',
            border:
              '1px solid #273653',
            borderRadius: '20px',
            padding: '30px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background:
                'rgba(0, 212, 255, 0.08)',
              right: '-80px',
              top: '-100px',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'flex',
              gap: '25px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, #00D4FF, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '42px',
                fontWeight: 'bold',
                boxShadow:
                  '0 0 35px rgba(0,212,255,.25)',
                overflow: 'hidden',
              }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                user.username
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div>
              <div
                style={{
                  color: '#00D4FF',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  fontWeight: 'bold',
                }}
              >
                CODEQUEST MEMBER
              </div>

              <h1
                style={{
                  margin: '6px 0',
                  fontSize: '32px',
                }}
              >
                {user.username}
              </h1>

              <p
                style={{
                  margin: 0,
                  color: '#9CA3AF',
                }}
              >
                {user.email}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '12px',
                }}
              >
                <Badge>
                  {user.title}
                </Badge>

                <Badge>
                  {user.className}
                </Badge>

                <Badge>
                  Nível {user.level}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginTop: '20px',
          }}
        >
          <Stat
            icon="⭐"
            title="XP"
            value={user.xp}
          />

          <Stat
            icon="🔥"
            title="Sequência atual"
            value={user.currentStreak}
          />

          <Stat
            icon="🏆"
            title="Maior sequência"
            value={user.longestStreak}
          />

          <Stat
            icon="🎖️"
            title="Nível"
            value={user.level}
          />
        </div>

        <section
          style={{
            background: '#0D1424',
            border:
              '1px solid #1F2937',
            borderRadius: '16px',
            padding: '25px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              gap: '10px',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                🚀 Progresso para o próximo nível
              </h2>

              <p
                style={{
                  color: '#9CA3AF',
                }}
              >
                Continue estudando para ganhar
                mais XP.
              </p>
            </div>

            <strong
              style={{
                color: '#00D4FF',
                fontSize: '18px',
              }}
            >
              {xpProgress}%
            </strong>
          </div>

          <div
            style={{
              height: '12px',
              background: '#1F2937',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${xpProgress}%`,
                height: '100%',
                background:
                  'linear-gradient(90deg, #00D4FF, #8B5CF6)',
                borderRadius: '20px',
              }}
            />
          </div>

          <p
            style={{
              color: '#6B7280',
              fontSize: '12px',
              marginBottom: 0,
            }}
          >
            {user.xp.toLocaleString(
              'pt-BR'
            )}{' '}
            /{' '}
            {xpForNextLevel.toLocaleString(
              'pt-BR'
            )}{' '}
            XP
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '15px',
            marginTop: '20px',
          }}
        >
          <div style={cardStyle}>
            <div style={iconStyle}>
              📅
            </div>

            <h3>
              Membro desde
            </h3>

            <p style={mutedStyle}>
              {new Date(
                user.joinedAt
              ).toLocaleDateString(
                'pt-BR'
              )}
            </p>
          </div>

          <div style={cardStyle}>
            <div style={iconStyle}>
              🧑‍💻
            </div>

            <h3>
              Classe atual
            </h3>

            <p style={mutedStyle}>
              {user.className}
            </p>
          </div>

          <div style={cardStyle}>
            <div style={iconStyle}>
              👑
            </div>

            <h3>
              Título
            </h3>

            <p style={mutedStyle}>
              {user.title}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: '20px',
        background: '#17233A',
        border:
          '1px solid #29415F',
        color: '#D1D5DB',
        fontSize: '11px',
      }}
    >
      {children}
    </span>
  );
}

function Stat({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: '#0D1424',
        border:
          '1px solid #1F2937',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '24px' }}>
        {icon}
      </div>

      <div
        style={{
          color: '#9CA3AF',
          fontSize: '12px',
          marginTop: '8px',
        }}
      >
        {title}
      </div>

      <strong
        style={{
          display: 'block',
          marginTop: '3px',
          fontSize: '24px',
        }}
      >
        {value.toLocaleString(
          'pt-BR'
        )}
      </strong>
    </div>
  );
}

const cardStyle = {
  background: '#0D1424',
  border: '1px solid #1F2937',
  borderRadius: '14px',
  padding: '20px',
};

const iconStyle = {
  fontSize: '28px',
};

const mutedStyle = {
  color: '#9CA3AF',
};