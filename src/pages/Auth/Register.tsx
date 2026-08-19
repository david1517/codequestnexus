import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
          border: '1px solid #8B5CF6',
          borderRadius: '10px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            marginBottom: '10px',
            color: '#8B5CF6',
            textAlign: 'center',
          }}
        >
          CRIAR CONTA
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#9CA3AF',
            marginBottom: '30px',
            fontSize: '14px',
          }}
        >
          Inicie sua jornada no nexus
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              Senha (min 6 caracteres)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              background: loading ? '#1F2937' : '#8B5CF6',
              color: loading ? '#9CA3AF' : 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Criando...' : 'Criar Conta'}
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
          Ja tem conta?{' '}
          <Link
            to="/auth/login"
            style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
