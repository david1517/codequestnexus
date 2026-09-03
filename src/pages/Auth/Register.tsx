  import { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import {
    User,
    GraduationCap,
    Shield,
    Mail,
    Lock,
    Phone,
    Calendar,
    BookOpen,
    FileText,
    Eye,
    EyeOff,
    Zap,
    ArrowLeft,
  } from 'lucide-react';

  import { useAuthStore } from '@/stores/useAuthStore';

  type Role = 'student' | 'teacher';

  export function Register() {
    const navigate = useNavigate();

    const {
      register,
      loading,
      error,
    } = useAuthStore();

    const [role, setRole] =
      useState<Role>('student');

    const [username, setUsername] =
      useState('');

    const [email, setEmail] =
      useState('');

    const [password, setPassword] =
      useState('');

    const [confirmPassword, setConfirmPassword] =
      useState('');

    const [name, setName] =
      useState('');

    const [phone, setPhone] =
      useState('');

    const [birthDate, setBirthDate] =
      useState('');

    const [knowledgeArea, setKnowledgeArea] =
      useState('');

    const [document, setDocument] =
      useState<File | null>(null);

    const [showPassword, setShowPassword] =
      useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
      useState(false);

    const [localError, setLocalError] =
      useState('');

    const handleSubmit = async (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      setLocalError('');

      if (!username.trim()) {
        setLocalError(
          'Digite seu nome de usuário.'
        );
        return;
      }

      if (!email.trim()) {
        setLocalError(
          'Digite seu email.'
        );
        return;
      }

      if (password.length < 6) {
        setLocalError(
          'A senha precisa ter pelo menos 6 caracteres.'
        );
        return;
      }

      if (password !== confirmPassword) {
        setLocalError(
          'As senhas não são iguais.'
        );
        return;
      }

      /*
      * Professor precisa preencher
      * informações adicionais.
      */
      if (role === 'teacher') {
        if (!name.trim()) {
          setLocalError(
            'Digite seu nome completo.'
          );
          return;
        }

        if (!phone.trim()) {
          setLocalError(
            'Digite seu telefone.'
          );
          return;
        }

        if (!birthDate) {
          setLocalError(
            'Informe sua data de nascimento.'
          );
          return;
        }

        if (!knowledgeArea.trim()) {
          setLocalError(
            'Informe sua área de conhecimento.'
          );
          return;
        }

        if (!document) {
          setLocalError(
            'Envie um documento que comprove seu conhecimento.'
          );
          return;
        }
      }

      try {
        await register({
          username,
          email,
          password,
          role,

          ...(role === 'teacher'
            ? {
                teacherApplication: {
                  name,
                  phone,
                  birthDate,
                  knowledgeArea,
                  document,
                },
              }
            : {}),
        });

        /*
        * Depois do cadastro:
        *
        * aluno -> dashboard
        * professor -> painel professor
        */
        if (role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/dashboard');
        }
      } catch {
        /*
        * O erro já fica guardado
        * no Zustand.
        */
      }
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      boxSizing: 'border-box',
      padding: '13px 14px',
      paddingLeft: '44px',
      borderRadius: '10px',
      border: '1px solid #263247',
      background: '#0B1220',
      color: 'white',
      outline: 'none',
      fontSize: '14px',
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      color: '#CBD5E1',
      fontSize: '13px',
      fontWeight: 600,
      marginBottom: '7px',
    };

  
    return (
      <div
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top, #16213D 0%, #070B14 55%, #03050A 100%)',
          color: 'white',
          padding: '30px 20px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94A3B8',
              textDecoration: 'none',
              marginBottom: '25px',
            }}
          >
            <ArrowLeft size={18} />
            Voltar
          </Link>

          <div
            style={{
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 15px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg, #00D4FF, #8B5CF6)',
              }}
            >
              <Zap
                size={28}
                color="white"
                fill="white"
              />
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '30px',
              }}
            >
              Criar conta
            </h1>

            <p
              style={{
                color: '#94A3B8',
                marginTop: '8px',
              }}
            >
              Entre para o CodeQuest Nexus
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: '#0D1525',
              border:
                '1px solid #1E293B',
              borderRadius: '18px',
              padding: '28px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: '18px',
              }}
            >
              1. Escolha seu tipo de conta
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '28px',
              }}
            >
              <RoleButton
                active={role === 'student'}
                icon={<User size={22} />}
                title="Aluno"
                description="Aprender e completar missões"
                onClick={() =>
                  setRole('student')
                }
              />

              <RoleButton
                active={role === 'teacher'}
                icon={
                  <GraduationCap size={22} />
                }
                title="Professor"
                description="Criar cursos e ensinar"
                onClick={() =>
                  setRole('teacher')
                }
              />
            </div>

            <h2
              style={{
                fontSize: '18px',
                marginBottom: '18px',
              }}
            >
              2. Seus dados
            </h2>

            <Field
              label="Nome de usuário"
              icon={<User size={18} />}
            >
              <input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Ex.: JoãoCoder"
                style={inputStyle}
              />
            </Field>

            <Field
              label="Email"
              icon={<Mail size={18} />}
            >
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="voce@email.com"
                style={inputStyle}
              />
            </Field>

            <Field
              label="Senha"
              icon={<Lock size={18} />}
            >
              <div
                style={{
                  position: 'relative',
                }}
              >
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Mínimo 6 caracteres"
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    background: 'none',
                    border: 0,
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </Field>

            <Field
              label="Confirmar senha"
              icon={<Lock size={18} />}
            >
              <div
                style={{
                  position: 'relative',
                }}
              >
                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Digite a senha novamente"
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    background: 'none',
                    border: 0,
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </Field>

            {role === 'teacher' && (
              <>
                <div
                  style={{
                    height: '1px',
                    background: '#1E293B',
                    margin:
                      '28px 0',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                  }}
                >
                  <GraduationCap
                    size={22}
                    color="#00D4FF"
                  />

                  <h2
                    style={{
                      margin: 0,
                      fontSize: '18px',
                    }}
                  >
                    3. Dados do professor
                  </h2>
                </div>

                <p
                  style={{
                    color: '#94A3B8',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                  }}
                >
                  Essas informações serão
                  analisadas pelo administrador
                  antes da aprovação da conta.
                </p>

                <Field
                  label="Nome completo"
                  icon={<User size={18} />}
                >
                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Seu nome completo"
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="Telefone"
                  icon={<Phone size={18} />}
                >
                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="(00) 00000-0000"
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="Data de nascimento"
                  icon={
                    <Calendar size={18} />
                  }
                >
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) =>
                      setBirthDate(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="Área de conhecimento"
                  icon={
                    <BookOpen size={18} />
                  }
                >
                  <input
                    value={knowledgeArea}
                    onChange={(e) =>
                      setKnowledgeArea(
                        e.target.value
                      )
                    }
                    placeholder="Ex.: JavaScript, Python, Matemática..."
                    style={inputStyle}
                  />
                </Field>

                <div
                  style={{
                    marginBottom: '20px',
                  }}
                >
                  <label
                    style={labelStyle}
                  >
                    Documento que comprova seu conhecimento
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      border:
                        '1px dashed #334155',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background:
                        '#0B1220',
                    }}
                  >
                    <FileText
                      size={22}
                      color="#00D4FF"
                    />

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            '13px',
                          fontWeight:
                            600,
                        }}
                      >
                        {document
                          ? document.name
                          : 'Clique para escolher um arquivo'}
                      </div>

                      <div
                        style={{
                          color:
                            '#64748B',
                          fontSize:
                            '11px',
                          marginTop:
                            '4px',
                        }}
                      >
                        PDF, JPG ou PNG
                      </div>
                    </div>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setDocument(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                      style={{
                        display: 'none',
                      }}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '14px',
                    background:
                      'rgba(0,212,255,0.06)',
                    border:
                      '1px solid rgba(0,212,255,0.15)',
                    borderRadius: '10px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  <Shield
                    size={18}
                    color="#00D4FF"
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <span>
                    Seu cadastro ficará
                    <strong
                      style={{
                        color: '#00D4FF',
                      }}
                    >
                      {' '}
                      pendente
                    </strong>{' '}
                    até um administrador
                    verificar suas informações.
                  </span>
                </div>
              </>
            )}

            {(localError || error) && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  background:
                    'rgba(255,68,68,0.1)',
                  border:
                    '1px solid rgba(255,68,68,0.3)',
                  color: '#FF8888',
                  fontSize: '13px',
                }}
              >
                {localError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '15px',
                border: 0,
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, #00D4FF, #8B5CF6)',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? 'Criando conta...'
                : role === 'teacher'
                  ? 'Enviar cadastro para aprovação'
                  : 'Criar conta de aluno'}
            </button>

            <p
              style={{
                textAlign: 'center',
                color: '#64748B',
                fontSize: '13px',
                marginTop: '20px',
              }}
            >
              Já possui uma conta?{' '}
              <Link
                to="/auth/login"
                style={{
                  color: '#00D4FF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  function Field({
    label,
    icon,
    children,
  }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) {
    return (
      <div
        style={{
          marginBottom: '18px',
        }}
      >
        <label
          style={{
            display: 'block',
            color: '#CBD5E1',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '7px',
          }}
        >
          {label}
        </label>

        <div
          style={{
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform:
                'translateY(-50%)',
              color: '#64748B',
              zIndex: 1,
            }}
          >
            {icon}
          </span>

          {children}
        </div>
      </div>
    );
  }

  function RoleButton({
    active,
    icon,
    title,
    description,
    onClick,
  }: {
    active: boolean;
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          textAlign: 'left',
          padding: '17px',
          borderRadius: '12px',
          border: active
            ? '1px solid #00D4FF'
            : '1px solid #263247',
          background: active
            ? 'rgba(0,212,255,0.08)'
            : '#0B1220',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: active
                ? '#00D4FF'
                : '#64748B',
            }}
          >
            {icon}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {title}
            </div>

            <div
              style={{
                color: '#64748B',
                fontSize: '11px',
                marginTop: '4px',
              }}
            >
              {description}
            </div>
          </div>
        </div>
      </button>
    );
  }