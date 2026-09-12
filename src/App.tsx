import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  useEffect,
  useState,
} from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleRoute } from '@/components/layout/RoleRoute';

import { Landing } from '@/pages/Landing/Landing';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';

import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Galaxy } from '@/pages/Galaxy/Galaxy';
import { Missions } from '@/pages/Missions/Missions';
import { Achievements } from '@/pages/Achievements/Achievements';
import { Lesson } from '@/pages/Lesson/Lesson';
import { Profile } from '@/pages/Profile/Profile';
import { Settings } from '@/pages/Settings/Settings';

import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { useAuthStore } from '@/stores/useAuthStore';

const SETTINGS_EVENT = 'codequest:settings-changed';

const PT_TO_EN: Record<string, string> = {
  'Dashboard': 'Dashboard',
  'Galáxia': 'Galaxy',
  'Missões': 'Missions',
  'Conquistas': 'Achievements',
  'Perfil': 'Profile',
  'Configurações': 'Settings',
  'Ajustes': 'Settings',
  'Ranking': 'Leaderboard',
  'Em construção': 'Under construction',

  'Aparência': 'Appearance',
  'Notificações': 'Notifications',
  'Som': 'Sound',
  'Preferências': 'Preferences',
  'Avaliações': 'Ratings',
  'Conta': 'Account',

  'Tema': 'Theme',
  'Escuro': 'Dark',
  'Claro': 'Light',
  'Sistema': 'System',

  'Tamanho da interface': 'Interface size',
  'Pequeno': 'Small',
  'Normal': 'Normal',
  'Grande': 'Large',

  'Idioma': 'Language',
  'Português (Brasil)': 'Portuguese (Brazil)',
  'English': 'English',

  'Sons da interface': 'Interface sounds',
  'Sons de conquistas': 'Achievement sounds',
  'Novas aulas': 'New lessons',

  'Enviar avaliação': 'Submit rating',
  'Atualizar avaliação': 'Update rating',
  'Testar som': 'Test sound',

  'Usuário': 'User',
  'E-mail': 'Email',
  'ID da conta': 'Account ID',
  'Sair da conta': 'Log out',

  'Curso': 'Course',
  'Nenhum curso disponível': 'No courses available',
};

const EN_TO_PT = Object.fromEntries(
  Object.entries(PT_TO_EN).map(([a, b]) => [b, a])
);

function getSettings(userId?: string) {
  const defaults = {
    theme: 'dark',
    interfaceSize: 'normal',
    language: 'pt-BR',
    sound: {
      interface: true,
      achievements: true,
    },
  };

  if (!userId) {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(
      `codequest-settings-${userId}`
    );

    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);

    return {
      ...defaults,
      ...parsed,
      sound: {
        ...defaults.sound,
        ...(parsed?.sound || {}),
      },
    };
  } catch {
    return defaults;
  }
}

/**
 * Traduz apenas textos simples da interface.
 * Não mexe em inputs, textarea, scripts ou estilos.
 */
function translatePage(language: 'pt-BR' | 'en') {
  const map =
    language === 'en'
      ? PT_TO_EN
      : EN_TO_PT;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let node: Node | null;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;

    if (
      !parent ||
      [
        'SCRIPT',
        'STYLE',
        'NOSCRIPT',
        'TEXTAREA',
        'INPUT',
      ].includes(parent.tagName)
    ) {
      continue;
    }

    const originalText = node.nodeValue;

    if (!originalText) {
      continue;
    }

    const text = originalText.trim();

    if (!text) {
      continue;
    }

    const translated = map[text];

    if (translated) {
      const leading =
        originalText.match(/^\s*/)?.[0] ?? '';

      const trailing =
        originalText.match(/\s*$/)?.[0] ?? '';

      node.nodeValue =
        leading +
        translated +
        trailing;
    }
  }

  document.documentElement.lang =
    language;
}

function playTone(
  kind: 'click' | 'success'
) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const ctx = new AudioContextClass();

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    oscillator.type = 'sine';

    const now = ctx.currentTime;

    const freq =
      kind === 'success'
        ? 660
        : 440;

    oscillator.frequency.setValueAtTime(
      freq,
      now
    );

    if (kind === 'success') {
      oscillator.frequency.exponentialRampToValueAtTime(
        880,
        now + 0.12
      );
    }

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.08,
      now + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.16
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.17);

    window.setTimeout(
      () => void ctx.close(),
      250
    );
  } catch {
    // Áudio é opcional.
  }
}

/**
 * Aplica o tema de forma global.
 *
 * Além de alterar o body, usamos variáveis CSS
 * para permitir que componentes que utilizem
 * essas variáveis acompanhem o tema.
 */
function applyTheme(
  dark: boolean
) {
  const root =
    document.documentElement;

  const body =
    document.body;

  root.dataset.codequestTheme =
    dark ? 'dark' : 'light';

  root.style.colorScheme =
    dark ? 'dark' : 'light';

  if (dark) {
    root.style.setProperty(
      '--cq-bg',
      '#050811'
    );

    root.style.setProperty(
      '--cq-surface',
      '#111827'
    );

    root.style.setProperty(
      '--cq-surface-2',
      '#1F2937'
    );

    root.style.setProperty(
      '--cq-text',
      '#FFFFFF'
    );

    root.style.setProperty(
      '--cq-text-secondary',
      '#D1D5DB'
    );

    root.style.setProperty(
      '--cq-text-muted',
      '#9CA3AF'
    );

    root.style.setProperty(
      '--cq-border',
      '#1F2937'
    );

    root.style.setProperty(
      '--cq-input',
      '#0F172A'
    );

    root.style.setProperty(
      '--cq-shadow',
      'rgba(0,0,0,0.35)'
    );

    body.style.backgroundColor =
      '#050811';

    body.style.color =
      '#FFFFFF';

    body.style.setProperty(
      '--cq-bg',
      '#050811'
    );

    body.style.setProperty(
      '--cq-surface',
      '#111827'
    );

    body.style.setProperty(
      '--cq-surface-2',
      '#1F2937'
    );

    body.style.setProperty(
      '--cq-text',
      '#FFFFFF'
    );

    body.style.setProperty(
      '--cq-text-secondary',
      '#D1D5DB'
    );

    body.style.setProperty(
      '--cq-text-muted',
      '#9CA3AF'
    );

    body.style.setProperty(
      '--cq-border',
      '#1F2937'
    );

    body.style.setProperty(
      '--cq-input',
      '#0F172A'
    );
  } else {
    root.style.setProperty(
      '--cq-bg',
      '#F5F7FB'
    );

    root.style.setProperty(
      '--cq-surface',
      '#FFFFFF'
    );

    root.style.setProperty(
      '--cq-surface-2',
      '#EEF2F7'
    );

    root.style.setProperty(
      '--cq-text',
      '#111827'
    );

    root.style.setProperty(
      '--cq-text-secondary',
      '#374151'
    );

    root.style.setProperty(
      '--cq-text-muted',
      '#6B7280'
    );

    root.style.setProperty(
      '--cq-border',
      '#D1D5DB'
    );

    root.style.setProperty(
      '--cq-input',
      '#FFFFFF'
    );

    root.style.setProperty(
      '--cq-shadow',
      'rgba(0,0,0,0.12)'
    );

    body.style.backgroundColor =
      '#F5F7FB';

    body.style.color =
      '#111827';

    body.style.setProperty(
      '--cq-bg',
      '#F5F7FB'
    );

    body.style.setProperty(
      '--cq-surface',
      '#FFFFFF'
    );

    body.style.setProperty(
      '--cq-surface-2',
      '#EEF2F7'
    );

    body.style.setProperty(
      '--cq-text',
      '#111827'
    );

    body.style.setProperty(
      '--cq-text-secondary',
      '#374151'
    );

    body.style.setProperty(
      '--cq-text-muted',
      '#6B7280'
    );

    body.style.setProperty(
      '--cq-border',
      '#D1D5DB'
    );

    body.style.setProperty(
      '--cq-input',
      '#FFFFFF'
    );
  }
}

function App() {
  const { user } =
    useAuthStore();

  const [
    notification,
    setNotification,
  ] = useState({
    visible: false,
    type:
      'success' as
        | 'success'
        | 'warning'
        | 'error',
    title: '',
    message: '',
  });

  const showNotification = (
    type:
      | 'success'
      | 'warning'
      | 'error',
    title: string,
    message: string
  ) => {
    setNotification({
      visible: true,
      type,
      title,
      message,
    });

    setTimeout(
      () =>
        setNotification(
          previous => ({
            ...previous,
            visible: false,
          })
        ),
      5000
    );
  };

  /**
   * Tema + tamanho + idioma.
   */
  useEffect(() => {
    const apply = () => {
      const settings =
        getSettings(user?.id);

      const prefersDark =
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;

      const dark =
        settings.theme === 'dark' ||
        (
          settings.theme ===
            'system' &&
          prefersDark
        );

      applyTheme(dark);

      document.body.style.zoom =
        (
          {
            small: '0.9',
            normal: '1',
            large: '1.1',
          } as Record<string, string>
        )[
          settings.interfaceSize
        ] || '1';

      translatePage(
        settings.language === 'en'
          ? 'en'
          : 'pt-BR'
      );
    };

    apply();

    const onSettings = () => {
      apply();
    };

    const onStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key?.startsWith(
          'codequest-settings-'
        )
      ) {
        apply();
      }
    };

    window.addEventListener(
      SETTINGS_EVENT,
      onSettings
    );

    window.addEventListener(
      'storage',
      onStorage
    );

    /**
     * Atualiza automaticamente quando
     * o usuário escolheu "Sistema".
     */
    const mediaQuery =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

    const onSystemThemeChange = () => {
      const settings =
        getSettings(user?.id);

      if (
        settings.theme === 'system'
      ) {
        apply();
      }
    };

    mediaQuery.addEventListener(
      'change',
      onSystemThemeChange
    );

    /**
     * Quando React cria elementos novos,
     * reaplicamos idioma e tema.
     */
    const observer =
      new MutationObserver(() => {
        const settings =
          getSettings(user?.id);

        if (
          settings.language === 'en'
        ) {
          translatePage('en');
        }
      });

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    return () => {
      window.removeEventListener(
        SETTINGS_EVENT,
        onSettings
      );

      window.removeEventListener(
        'storage',
        onStorage
      );

      mediaQuery.removeEventListener(
        'change',
        onSystemThemeChange
      );

      observer.disconnect();
    };
  }, [user?.id]);

  /**
   * Sons.
   */
  useEffect(() => {
    const onSound = (
      event: Event
    ) => {
      const detail =
        (event as CustomEvent)
          .detail as
          | {
              kind?:
                | 'click'
                | 'success';
            }
          | undefined;

      const settings =
        getSettings(user?.id);

      if (
        detail?.kind ===
          'success' &&
        settings.sound
          ?.achievements === false
      ) {
        return;
      }

      if (
        detail?.kind === 'click' &&
        settings.sound
          ?.interface === false
      ) {
        return;
      }

      playTone(
        detail?.kind ===
          'success'
          ? 'success'
          : 'click'
      );
    };

    const onClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as
          | HTMLElement
          | null;

      if (
        !target?.closest(
          'button, a, select, [role="button"]'
        )
      ) {
        return;
      }

      const settings =
        getSettings(user?.id);

      if (
        settings.sound
          ?.interface !== false
      ) {
        playTone('click');
      }
    };

    window.addEventListener(
      'codequest:sound',
      onSound
    );

    document.addEventListener(
      'click',
      onClick
    );

    return () => {
      window.removeEventListener(
        'codequest:sound',
        onSound
      );

      document.removeEventListener(
        'click',
        onClick
      );
    };
  }, [user?.id]);

  /**
   * Verificação do Firebase.
   */
  useEffect(() => {
    const checkFirebase =
      async () => {
        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              1000
            )
        );

        const apiKey =
          import.meta.env
            .VITE_FIREBASE_API_KEY;

        if (!apiKey) {
          showNotification(
            'warning',
            '💾 Modo Local',
            'Firebase não configurado. Os dados serão salvos no navegador.'
          );

          return;
        }

        try {
          const firebase =
            await import(
              '@/lib/firebase'
            );

          if (
            firebase.firebaseConnected
          ) {
            showNotification(
              'success',
              '☁️ Firebase Conectado!',
              'Seus dados serão salvos na nuvem.'
            );
          } else {
            showNotification(
              'warning',
              '⏳ Firebase',
              'Firebase ainda não está conectado.'
            );
          }
        } catch {
          showNotification(
            'error',
            '❌ Erro Firebase',
            'Verifique o arquivo .env.'
          );
        }
      };

    checkFirebase();
  }, []);

  const Notification = () => {
    if (
      !notification.visible
    ) {
      return null;
    }

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

    const color =
      colorMap[
        notification.type
      ];

    return (
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background:
            'var(--cq-surface, #111827)',
          color:
            'var(--cq-text, #FFFFFF)',
          border:
            `2px solid ${color}`,
          borderRadius: 10,
          padding:
            '15px 20px',
          maxWidth: 350,
          zIndex: 9999,
          boxShadow:
            `0 0 30px ${color}80`,
          fontFamily:
            'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
            }}
          >
            {
              iconMap[
                notification.type
              ]
            }
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <h3
              style={{
                color,
                fontSize: 14,
                fontWeight: 'bold',
                margin: 0,
                marginBottom: 4,
              }}
            >
              {
                notification.title
              }
            </h3>

            <p
              style={{
                color:
                  'var(--cq-text-secondary, #D1D5DB)',
                fontSize: 12,
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {
                notification.message
              }
            </p>
          </div>

          <button
            onClick={() =>
              setNotification(
                previous => ({
                  ...previous,
                  visible: false,
                })
              )
            }
            style={{
              background:
                'transparent',
              border: 'none',
              color:
                'var(--cq-text-muted, #9CA3AF)',
              cursor: 'pointer',
              fontSize: 18,
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
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/auth/login"
          element={<Login />}
        />

        <Route
          path="/auth/register"
          element={<Register />}
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  'teacher',
                ]}
              >
                <TeacherDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  'admin',
                ]}
              >
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/galaxy"
            element={<Galaxy />}
          />

          <Route
            path="/missions"
            element={<Missions />}
          />

          <Route
            path="/achievements"
            element={<Achievements />}
          />

          <Route
            path="/lesson/:courseSlug/:lessonId"
            element={<Lesson />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/leaderboard"
            element={
              <Placeholder
                title="Ranking"
              />
            }
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

function Placeholder({
  title,
}: {
  title: string;
}) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color:
          'var(--cq-text, white)',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 'bold',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color:
            'var(--cq-text-muted, #9CA3AF)',
          marginTop: 10,
        }}
      >
        Em construção
      </p>
    </div>
  );
}

export default App;