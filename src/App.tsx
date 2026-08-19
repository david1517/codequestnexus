import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Landing } from '@/pages/Landing/Landing';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Galaxy } from '@/pages/Galaxy/Galaxy';
import { Missions } from '@/pages/Missions/Missions';
import { Achievements } from '@/pages/Achievements/Achievements';
import { Lesson } from '@/pages/Lesson/Lesson';
import { Profile } from '@/pages/Profile/Profile';

function App() {
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: '',
  });

  const showNotification = (
    type: 'success' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    setNotification({ visible: true, type, title, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  useEffect(() => {
    const checkFirebase = async () => {
      // Espera 1 segundo pra dar tempo do Firebase carregar
      await new Promise((r) => setTimeout(r, 1000));

      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

      if (!apiKey) {
        showNotification(
          'warning',
          '💾 Modo Local',
          'Firebase não configurado. Dados no navegador.'
        );
        return;
      }

      // Verifica se firebase.ts conseguiu conectar
      try {
        const firemodule = await import('@/lib/firebase');
        if (firemodule.firebaseConnected) {
          showNotification(
            'success',
            '☁️ Firebase Conectado!',
            'Seus dados serão salvos na nuvem'
          );
        } else {
          showNotification(
            'warning',
            '⏳ Firebase Carregando...',
            'Tentando conectar ao servidor...'
          );
          // Tenta de novo depois de 3 segundos
          setTimeout(async () => {
            try {
              const fm = await import('@/lib/firebase');
              if (fm.firebaseConnected) {
                showNotification(
                  'success',
                  '☁️ Firebase Conectado!',
                  'Seus dados serão salvos na nuvem'
                );
              }
            } catch {}
          }, 3000);
        }
      } catch (err) {
        showNotification(
          'error',
          '❌ Erro Firebase',
          'Verifique o arquivo .env'
        );
      }
    };

    checkFirebase();
  }, []);

  // Renderiza notificação
  const Notification = () => {
    if (!notification.visible) return null;

    const colorMap = {
      success: '#00FF88',
      warning: '#FFD700',
      error: '#FF4444',
    };
    const iconMap = {
      success: '☁️',
      warning: '⚠️',
      error: '❌',
    };
    const c = colorMap[notification.type];
    const icon = iconMap[notification.type];

    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#111827',
          border: '2px solid ' + c,
          borderRadius: '10px',
          padding: '15px 20px',
          maxWidth: '350px',
          zIndex: 9999,
          boxShadow: '0 0 30px ' + c + '80',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ fontSize: '28px' }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: c, fontSize: '14px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>
              {notification.title}
            </h3>
            <p style={{ color: '#D1D5DB', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification({ ...notification, visible: false })}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '18px',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Notification />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/galaxy" element={<Galaxy />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/lesson/:courseSlug/:lessonId" element={<Lesson />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Placeholder title="Ranking" />} />
          <Route path="/settings" element={<Placeholder title="Ajustes" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{title}</h1>
      <p style={{ color: '#9CA3AF', marginTop: '10px' }}>Em construção</p>
    </div>
  );
}

export default App;
