import type { ReactNode } from 'react';
import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  User,
  GraduationCap,
  Shield,
  Upload,
  ArrowLeft,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/useAuthStore';

import type { UserRole } from '@/types';

export function Register() {
  const navigate =
    useNavigate();

  const { register, loading, error } =
    useAuthStore();

  const [role, setRole] =
    useState<UserRole>('student');

  const [username, setUsername] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [teacherName, setTeacherName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [birthDate, setBirthDate] =
    useState('');

  const [knowledgeArea, setKnowledgeArea] =
    useState('');

  const [document, setDocument] =
    useState<File | null>(null);

  const [localError, setLocalError] =
    useState('');

  function handleDocument(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      setDocument(null);
      return;
    }

    /*
     * Permitimos documentos comuns.
     */
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setLocalError(
        'Envie um PDF, JPG ou PNG.'
      );

      event.target.value = '';

      return;
    }

    /*
     * Limite de 10 MB.
     */
    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setLocalError(
        'O documento deve ter no máximo 10 MB.'
      );

      event.target.value = '';

      return;
    }

    setLocalError('');

    setDocument(file);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLocalError('');

    /*
     * Validação básica do professor.
     */
    if (role === 'teacher') {
      if (!teacherName.trim()) {
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
                name:
                  teacherName,
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
       * aluno → dashboard
       * professor → painel professor
       * admin → painel admin
       */
      if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    } catch {
      /*
       * O erro já é guardado
       * pelo AuthStore.
       */
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* VOLTAR */}

        <Link
          to="/"
          style={backButtonStyle}
        >
          <ArrowLeft size={16} />

          Voltar
        </Link>

        {/* LOGO */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <div style={logoStyle}>
            ⚡
          </div>

          <h1
            style={{
              margin:
                '15px 0 5px',
              fontSize: '26px',
            }}
          >
            Criar conta
          </h1>

          <p
            style={{
              margin: 0,
              color: '#9CA3AF',
              fontSize: '13px',
            }}
          >
            Entre para o CODEQUEST NEXUS
          </p>
        </div>

        {/* TIPO DE CONTA */}

        <div style={roleSectionStyle}>
          <label
            style={labelStyle}
          >
            Tipo de conta
          </label>

          <div
            style={roleGridStyle}
          >
            <RoleButton
              active={
                role === 'student'
              }
              icon={
                <User size={20} />
              }
              title="Aluno"
              description="Aprender e completar cursos"
              onClick={() =>
                setRole(
                  'student'
                )
              }
            />

            <RoleButton
              active={
                role === 'teacher'
              }
              icon={
                <GraduationCap
                  size={20}
                />
              }
              title="Professor"
              description="Criar e ensinar cursos"
              onClick={() =>
                setRole(
                  'teacher'
                )
              }
            />

            {/*
             * O botão de ADM NÃO aparece.
             *
             * O administrador será criado
             * de forma controlada.
             */}
          </div>

          {role === 'teacher' && (
            <div
              style={teacherNoticeStyle}
            >
              <Shield
                size={18}
              />

              <span>
                Contas de professor precisam
                ser analisadas e aprovadas
                pelo administrador.
              </span>
            </div>
          )}
        </div>

        {/* FORMULÁRIO */}

        <form
          onSubmit={
            handleSubmit
          }
        >
          {/* USUÁRIO */}

          <div
            style={fieldStyle}
          >
            <label
              htmlFor="username"
              style={labelStyle}
            >
              Nome de usuário
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Como você quer ser chamado?"
              required
              style={inputStyle}
            />
          </div>

          {/* EMAIL */}

          <div
            style={fieldStyle}
          >
            <label
              htmlFor="email"
              style={labelStyle}
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="seu@email.com"
              required
              style={inputStyle}
            />
          </div>

          {/* DADOS DO PROFESSOR */}

          {role === 'teacher' && (
            <>
              <div
                style={
                  dividerStyle
                }
              >
                Dados do professor
              </div>

              <div
                style={fieldStyle}
              >
                <label
                  htmlFor="teacherName"
                  style={labelStyle}
                >
                  Nome completo
                </label>

                <input
                  id="teacherName"
                  type="text"
                  value={
                    teacherName
                  }
                  onChange={(event) =>
                    setTeacherName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Seu nome completo"
                  required
                  style={inputStyle}
                />
              </div>

              <div
                style={fieldStyle}
              >
                <label
                  htmlFor="phone"
                  style={labelStyle}
                >
                  Telefone
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  placeholder="(00) 00000-0000"
                  required
                  style={inputStyle}
                />
              </div>

              <div
                style={fieldStyle}
              >
                <label
                  htmlFor="birthDate"
                  style={labelStyle}
                >
                  Data de nascimento
                </label>

                <input
                  id="birthDate"
                  type="date"
                  value={
                    birthDate
                  }
                  onChange={(event) =>
                    setBirthDate(
                      event.target
                        .value
                    )
                  }
                  required
                  style={inputStyle}
                />
              </div>

              <div
                style={fieldStyle}
              >
                <label
                  htmlFor="knowledgeArea"
                  style={labelStyle}
                >
                  Área de conhecimento
                </label>

                <input
                  id="knowledgeArea"
                  type="text"
                  value={
                    knowledgeArea
                  }
                  onChange={(event) =>
                    setKnowledgeArea(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ex.: JavaScript, Python, Design..."
                  required
                  style={inputStyle}
                />
              </div>

              {/* DOCUMENTO */}

              <div
                style={fieldStyle}
              >
                <label
                  style={labelStyle}
                >
                  Documento comprobatório
                </label>

                <label
                  htmlFor="document"
                  style={
                    uploadBoxStyle
                  }
                >
                  <Upload
                    size={25}
                  />

                  <strong>
                    {document
                      ? document.name
                      : 'Clique para enviar o documento'}
                  </strong>

                  <span>
                    PDF, JPG ou PNG — máximo
                    10 MB
                  </span>
                </label>

                <input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleDocument
                  }
                  style={{
                    display:
                      'none',
                  }}
                />
              </div>
            </>
          )}

          {/* SENHA */}

          <div
            style={fieldStyle}
          >
            <label
              htmlFor="password"
              style={labelStyle}
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target
                    .value
                )
              }
              placeholder="Crie uma senha"
              required
              minLength={6}
              style={inputStyle}
            />

            <span
              style={{
                color: '#6B7280',
                fontSize: '11px',
              }}
            >
              Mínimo de 6 caracteres.
            </span>
          </div>

          {/* ERROS */}

          {(localError ||
            error) && (
            <div
              style={
                errorStyle
              }
            >
              {localError ||
                error}
            </div>
          )}

          {/* BOTÃO */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              opacity:
                loading
                  ? 0.6
                  : 1,
            }}
          >
            {loading
              ? 'Criando conta...'
              : role ===
                'teacher'
              ? 'Enviar cadastro para análise'
              : 'Criar conta'}
          </button>
        </form>

        {/* LOGIN */}

        <p
          style={{
            textAlign:
              'center',
            color:
              '#9CA3AF',
            fontSize:
              '13px',
            marginTop:
              '25px',
          }}
        >
          Já possui uma conta?{' '}
          <Link
            to="/auth/login"
            style={{
              color:
                '#00D4FF',
              textDecoration:
                'none',
              fontWeight:
                'bold',
            }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

/* =========================
   BOTÃO DE TIPO DE CONTA
========================= */

function RoleButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
 icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '16px',
        textAlign: 'left',
        borderRadius:
          '10px',
        border: active
          ? '2px solid #00D4FF'
          : '1px solid #374151',
        background: active
          ? '#0C2433'
          : '#0F172A',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          marginBottom:
            '8px',
          color: active
            ? '#00D4FF'
            : '#9CA3AF',
        }}
      >
        {icon}
      </div>

      <strong
        style={{
          display:
            'block',
          marginBottom:
            '5px',
        }}
      >
        {title}
      </strong>

      <span
        style={{
          display:
            'block',
          color:
            '#9CA3AF',
          fontSize:
            '11px',
          lineHeight:
            1.4,
        }}
      >
        {description}
      </span>
    </button>
  );
}

/* =========================
   ESTILOS
========================= */

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '40px 20px',
  background: '#050816',
  color: 'white',
  fontFamily: 'sans-serif',
};

const cardStyle = {
  width: '100%',
  maxWidth: '600px',
  padding: '30px',
  background: '#0B1120',
  border: '1px solid #1F2937',
  borderRadius: '16px',
  boxShadow:
    '0 20px 60px rgba(0,0,0,0.35)',
};

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: '#9CA3AF',
  textDecoration: 'none',
  fontSize: '12px',
};

const logoStyle = {
  width: '55px',
  height: '55px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '14px',
  background:
    'linear-gradient(135deg, #00D4FF, #8B5CF6)',
  fontSize: '26px',
};

const roleSectionStyle = {
  marginBottom: '25px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#D1D5DB',
  fontSize: '12px',
  fontWeight: 'bold',
};

const roleGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, 1fr)',
  gap: '10px',
};

const teacherNoticeStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  marginTop: '12px',
  padding: '12px',
  background: '#172033',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#CBD5E1',
  fontSize: '12px',
  lineHeight: 1.5,
};

const fieldStyle = {
  marginBottom: '18px',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '12px 14px',
  background: '#0F172A',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: 'white',
  outline: 'none',
  fontSize: '13px',
};

const dividerStyle = {
  paddingBottom: '10px',
  marginBottom: '20px',
  borderBottom:
    '1px solid #1F2937',
  color: '#00D4FF',
  fontSize: '13px',
  fontWeight: 'bold',
};

const uploadBoxStyle = {
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '15px',
  border: '2px dashed #374151',
  borderRadius: '10px',
  background: '#0F172A',
  color: '#D1D5DB',
  cursor: 'pointer',
  textAlign: 'center' as const,
};

const errorStyle = {
  marginBottom: '18px',
  padding: '12px',
  background: '#3F1118',
  border: '1px solid #7F1D1D',
  borderRadius: '8px',
  color: '#FCA5A5',
  fontSize: '12px',
};

const submitButtonStyle = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '9px',
  background:
    'linear-gradient(135deg, #00D4FF, #8B5CF6)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
};