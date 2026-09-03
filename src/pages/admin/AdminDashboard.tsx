import { useState } from 'react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'teachers' | 'theme'
  >('overview');

  const [background, setBackground] = useState('#050816');
  const [primaryColor, setPrimaryColor] = useState('#00D4FF');

  const teachers = [
    {
      id: 1,
      name: 'Professor de Demonstração',
      email: 'professor@codequest.com',
      area: 'Programação',
      status: 'Pendente',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background,
        color: 'white',
        padding: '30px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: '30px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '20px',
              background: `${primaryColor}22`,
              border: `1px solid ${primaryColor}`,
              color: primaryColor,
              fontSize: '12px',
              marginBottom: '10px',
            }}
          >
            ÁREA ADMINISTRATIVA
          </div>

          <h1
            style={{
              fontSize: '36px',
              margin: '0 0 8px',
            }}
          >
            Painel do Administrador
          </h1>

          <p
            style={{
              color: '#9CA3AF',
              margin: 0,
            }}
          >
            Gerencie professores, usuários e aparência do CodeQuest.
          </p>
        </header>

        <nav
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={buttonStyle(activeTab === 'overview', primaryColor)}
          >
            Visão geral
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            style={buttonStyle(activeTab === 'teachers', primaryColor)}
          >
            Professores
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            style={buttonStyle(activeTab === 'theme', primaryColor)}
          >
            Tema do site
          </button>
        </nav>

        {activeTab === 'overview' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <StatCard
              title="Usuários"
              value="0"
              description="Usuários cadastrados"
              color={primaryColor}
            />

            <StatCard
              title="Professores"
              value="0"
              description="Professores aprovados"
              color="#8B5CF6"
            />

            <StatCard
              title="Pendentes"
              value="1"
              description="Cadastros aguardando análise"
              color="#FFD700"
            />

            <StatCard
              title="Cursos"
              value="0"
              description="Cursos publicados"
              color="#00FF88"
            />
          </div>
        )}

        {activeTab === 'teachers' && (
          <section>
            <div
              style={{
                background: '#111827',
                border: '1px solid #1F2937',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Aprovação de professores
              </h2>

              <p
                style={{
                  color: '#9CA3AF',
                  lineHeight: 1.6,
                }}
              >
                Quando o cadastro de um professor estiver conectado ao
                Firebase, os pedidos aparecerão aqui para análise.
              </p>

              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    borderRadius: '10px',
                    background: '#0A1020',
                    border: '1px solid #374151',
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {teacher.name}
                  </h3>

                  <p style={{ color: '#D1D5DB' }}>
                    Email: {teacher.email}
                  </p>

                  <p style={{ color: '#D1D5DB' }}>
                    Área: {teacher.area}
                  </p>

                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: '#FFD70022',
                      color: '#FFD700',
                      fontSize: '12px',
                    }}
                  >
                    {teacher.status}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '20px',
                    }}
                  >
                    <button
                      style={{
                        padding: '10px 16px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#00FF88',
                        color: '#00150A',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Aprovar
                    </button>

                    <button
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #FF4444',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#FF4444',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'theme' && (
          <section>
            <div
              style={{
                background: '#111827',
                border: '1px solid #1F2937',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Personalização do site
              </h2>

              <p
                style={{
                  color: '#9CA3AF',
                  marginBottom: '30px',
                }}
              >
                Aqui o administrador poderá alterar as cores e o
                fundo do CodeQuest.
              </p>

              <div
                style={{
                  display: 'grid',
                  gap: '20px',
                  maxWidth: '500px',
                }}
              >
                <label>
                  <span
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Cor principal
                  </span>

                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) =>
                      setPrimaryColor(event.target.value)
                    }
                    style={{
                      width: '100%',
                      height: '50px',
                      cursor: 'pointer',
                    }}
                  />
                </label>

                <label>
                  <span
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Cor do fundo
                  </span>

                  <input
                    type="color"
                    value={background}
                    onChange={(event) =>
                      setBackground(event.target.value)
                    }
                    style={{
                      width: '100%',
                      height: '50px',
                      cursor: 'pointer',
                    }}
                  />
                </label>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    border: `1px solid ${primaryColor}`,
                    background,
                  }}
                >
                  <strong style={{ color: primaryColor }}>
                    Pré-visualização
                  </strong>

                  <p style={{ color: '#D1D5DB' }}>
                    Assim ficará o fundo do painel.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #1F2937',
        borderRadius: '14px',
        padding: '24px',
      }}
    >
      <div
        style={{
          color,
          fontSize: '13px',
          fontWeight: 'bold',
          marginBottom: '10px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '8px',
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: '#9CA3AF',
          fontSize: '13px',
        }}
      >
        {description}
      </div>
    </div>
  );
}

function buttonStyle(
  active: boolean,
  color: string
): React.CSSProperties {
  return {
    padding: '10px 16px',
    borderRadius: '8px',
    border: active
      ? `1px solid ${color}`
      : '1px solid #374151',
    background: active ? `${color}22` : '#111827',
    color: active ? color : '#D1D5DB',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
  };
}