import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await login(email, password);

      // Pega o usuário atualizado depois do login.
      // O login já buscou o role no Firestore.
      const loggedUser = useAuthStore.getState().user;

      console.log('🔐 Usuário após login:', {
        email: loggedUser?.email,
        role: loggedUser?.role,
      });

      if (!loggedUser) {
        throw new Error('Usuário não encontrado após o login.');
      }

      // Cada tipo de usuário vai para sua própria área.
      if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      if (loggedUser.role === 'teacher') {
        navigate('/teacher', { replace: true });
        return;
      }

      // Alunos continuam indo para o dashboard.
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao entrar';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050816',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#111827',
          border: '1px solid #00D4FF',
          borderRadius: '10px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            marginBottom: '10px',
            color: '#00D4FF',
            textAlign: 'center',
          }}
        >
          CODEQUEST NEXUS
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#9CA3AF',
            marginBottom: '30px',
            fontSize: '14px',
          }}
        >
          Entre para continuar sua jornada
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px',
                color: '#D1D5DB',
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                background: '#0A1020',
                border: '1px solid #1F2937',
                borderRadius: '5px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px',
                color: '#D1D5DB',
              }}
            >
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                background: '#0A1020',
                border: '1px solid #1F2937',
                borderRadius: '5px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '5px',
                padding: '10px',
                marginBottom: '15px',
                color: '#ef4444',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#1F2937' : '#00D4FF',
              color: loading ? '#9CA3AF' : 'black',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no Nexus'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '14px',
            color: '#9CA3AF',
          }}
        >
          Nao tem conta?{' '}
          <Link
            to="/auth/register"
            style={{
              color: '#00D4FF',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Criar agora
          </Link>
        </p>
      </div>
    </div>
  );
}