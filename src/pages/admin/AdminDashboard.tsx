import { useState } from 'react';
import type { TeacherApplication } from '@/types';

const initialApplications: TeacherApplication[] = [
  {
    id: 'application-demo-001',
    userId: 'teacher-demo-001',
    name: 'Professor Demonstração',
    email: 'professor@codequest.local',
    phone: '(11) 99999-9999',
    birthDate: '1990-05-20',
    knowledgeArea: 'Programação',
    documentUrl: '#',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  },
];

const themes = [
  {
    name: 'Nexus',
    primary: '#00D4FF',
    secondary: '#8B5CF6',
    background: '#080D19',
  },
  {
    name: 'Cyber',
    primary: '#00FF88',
    secondary: '#00D4FF',
    background: '#06110F',
  },
  {
    name: 'Galaxy',
    primary: '#C084FC',
    secondary: '#6366F1',
    background: '#0D0920',
  },
];

export function AdminDashboard() {
  const [applications, setApplications] =
    useState<TeacherApplication[]>(
      initialApplications
    );

  const [selectedId, setSelectedId] =
    useState<string | null>(
      initialApplications[0]?.id || null
    );

  const [selectedTheme, setSelectedTheme] =
    useState(themes[0]);

  const [background, setBackground] =
    useState('#080D19');

  const selectedApplication =
    applications.find(
      (application) =>
        application.id === selectedId
    ) || null;

  function approve(id: string) {
    setApplications((old) =>
      old.map((application) =>
        application.id === id
          ? {
              ...application,
              status: 'approved',
              reviewedAt:
                new Date().toISOString(),
              reviewedBy: 'admin',
            }
          : application
      )
    );
  }

  function reject(id: string) {
    setApplications((old) =>
      old.map((application) =>
        application.id === id
          ? {
              ...application,
              status: 'rejected',
              reviewedAt:
                new Date().toISOString(),
              reviewedBy: 'admin',
              rejectionReason:
                'Dados precisam ser revisados.',
            }
          : application
      )
    );
  }

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
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              color: selectedTheme.primary,
              fontSize: '12px',
              letterSpacing: '4px',
              fontWeight: 'bold',
            }}
          >
            NEXUS ADMINISTRATION
          </div>

          <h1
            style={{
              fontSize: '34px',
              margin: '8px 0',
            }}
          >
            👑 Central Administrativa
          </h1>

          <p
            style={{
              color: '#9CA3AF',
            }}
          >
            Área restrita para gerenciamento do
            CodeQuest.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '25px',
          }}
        >
          <AdminStat
            icon="⏳"
            title="Pendentes"
            value={
              applications.filter(
                (item) => item.status === 'pending'
              ).length
            }
          />

          <AdminStat
            icon="✅"
            title="Aprovados"
            value={
              applications.filter(
                (item) => item.status === 'approved'
              ).length
            }
          />

          <AdminStat
            icon="❌"
            title="Rejeitados"
            value={
              applications.filter(
                (item) => item.status === 'rejected'
              ).length
            }
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '320px minmax(0, 1fr)',
            gap: '20px',
          }}
        >
          <section
            style={{
              background: '#0D1424',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '15px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                margin: '5px 5px 15px',
              }}
            >
              👨‍🏫 Professores
            </h2>

            {applications.length === 0 && (
              <p
                style={{
                  color: '#6B7280',
                }}
              >
                Nenhuma solicitação.
              </p>
            )}

            {applications.map((application) => (
              <button
                key={application.id}
                onClick={() =>
                  setSelectedId(application.id)
                }
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background:
                    selectedId === application.id
                      ? '#17233A'
                      : 'transparent',
                  border: '1px solid #1F2937',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '8px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <strong>
                  {application.name}
                </strong>

                <div
                  style={{
                    color: '#9CA3AF',
                    fontSize: '12px',
                    marginTop: '5px',
                  }}
                >
                  {application.knowledgeArea}
                </div>

                <Status status={application.status} />
              </button>
            ))}
          </section>

          <section
            style={{
              background: '#0D1424',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '25px',
            }}
          >
            {selectedApplication ? (
              <>
                <h2>
                  📋 Dados do professor
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '15px',
                    marginTop: '20px',
                  }}
                >
                  <Data
                    label="Nome"
                    value={
                      selectedApplication.name
                    }
                  />

                  <Data
                    label="Email"
                    value={
                      selectedApplication.email
                    }
                  />

                  <Data
                    label="Telefone"
                    value={
                      selectedApplication.phone
                    }
                  />

                  <Data
                    label="Nascimento"
                    value={
                      selectedApplication.birthDate
                    }
                  />

                  <Data
                    label="Área"
                    value={
                      selectedApplication.knowledgeArea
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    background: '#080D19',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <strong>
                    📄 Documento profissional
                  </strong>

                  <p
                    style={{
                      color: '#9CA3AF',
                      fontSize: '13px',
                    }}
                  >
                    O documento enviado pelo professor
                    aparecerá aqui quando o Firebase
                    estiver conectado.
                  </p>

                  <a
                    href={
                      selectedApplication.documentUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: selectedTheme.primary,
                    }}
                  >
                    👁️ Visualizar documento
                  </a>
                </div>

                {selectedApplication.status ===
                  'pending' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() =>
                        approve(
                          selectedApplication.id
                        )
                      }
                      style={approveButton}
                    >
                      ✅ Aprovar professor
                    </button>

                    <button
                      onClick={() =>
                        reject(
                          selectedApplication.id
                        )
                      }
                      style={rejectButton}
                    >
                      ❌ Rejeitar
                    </button>
                  </div>
                )}

                {selectedApplication.status ===
                  'approved' && (
                  <div
                    style={successBox}
                  >
                    ✅ Professor aprovado.
                  </div>
                )}

                {selectedApplication.status ===
                  'rejected' && (
                  <div
                    style={errorBox}
                  >
                    ❌ Professor rejeitado.
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  padding: '80px 20px',
                  textAlign: 'center',
                  color: '#9CA3AF',
                }}
              >
                Selecione uma solicitação.
              </div>
            )}
          </section>
        </div>

        <section
          style={{
            marginTop: '20px',
            background: '#0D1424',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '25px',
          }}
        >
          <h2>🎨 Aparência do site</h2>

          <p
            style={{
              color: '#9CA3AF',
            }}
          >
            Escolha o tema que será utilizado pelo
            site.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() =>
                  setSelectedTheme(theme)
                }
                style={{
                  padding: '15px',
                  minWidth: '150px',
                  borderRadius: '10px',
                  border:
                    selectedTheme.name ===
                    theme.name
                      ? `2px solid ${theme.primary}`
                      : '1px solid #29364D',
                  background: theme.background,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <strong>
                  {theme.name}
                </strong>

                <div
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: theme.primary,
                    }}
                  />

                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: theme.secondary,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: '25px',
              maxWidth: '500px',
            }}
          >
            <label
              style={{
                color: '#D1D5DB',
                fontSize: '13px',
              }}
            >
              Fundo personalizado
            </label>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '8px',
              }}
            >
              <input
                type="color"
                value={background}
                onChange={(event) =>
                  setBackground(
                    event.target.value
                  )
                }
                style={{
                  width: '55px',
                  height: '45px',
                }}
              />

              <input
                value={background}
                onChange={(event) =>
                  setBackground(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              borderRadius: '10px',
              background: selectedTheme.background,
              border: `1px solid ${selectedTheme.primary}`,
            }}
          >
            <strong>
              Pré-visualização do tema
            </strong>

            <p
              style={{
                color: selectedTheme.primary,
              }}
            >
              Este é o visual que o administrador
              escolheu.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminStat({
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
        border: '1px solid #1F2937',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '25px' }}>
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
          fontSize: '25px',
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function Data({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: '#111827',
        borderRadius: '10px',
        padding: '15px',
      }}
    >
      <div
        style={{
          color: '#6B7280',
          fontSize: '11px',
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display: 'block',
          marginTop: '5px',
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function Status({
  status,
}: {
  status: TeacherApplication['status'];
}) {
  const data = {
    pending: ['⏳ Pendente', '#FFD700'],
    approved: ['✅ Aprovado', '#00FF88'],
    rejected: ['❌ Rejeitado', '#FF4444'],
  }[status];

  return (
    <div
      style={{
        marginTop: '8px',
        color: data[1],
        fontSize: '11px',
        fontWeight: 'bold',
      }}
    >
      {data[0]}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  background: '#080D19',
  border: '1px solid #29364D',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
};

const approveButton = {
  border: 'none',
  borderRadius: '9px',
  padding: '12px 18px',
  background: '#00A86B',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const rejectButton = {
  border: 'none',
  borderRadius: '9px',
  padding: '12px 18px',
  background: '#9F1239',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const successBox = {
  marginTop: '20px',
  padding: '15px',
  borderRadius: '10px',
  background: '#052E1B',
  color: '#00FF88',
};

const errorBox = {
  marginTop: '20px',
  padding: '15px',
  borderRadius: '10px',
  background: '#3B0A14',
  color: '#FF4444',
};