import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const location = useLocation();

  // Se ainda não inicializou, espera
  if (!initialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050816',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não tá logado, manda pro login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
