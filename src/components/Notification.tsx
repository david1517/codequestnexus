import { useState } from 'react';

interface NotificationState {
  visible: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showNotification = (
    type: NotificationState['type'],
    title: string,
    message: string
  ) => {
    setNotification({ visible: true, type, title, message });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  return { notification, showNotification, setNotification };
}

export function NotificationBanner({
  notification,
  onClose,
}: {
  notification: NotificationState;
  onClose: () => void;
}) {
  if (!notification.visible) return null;

  const colors: Record<NotificationState['type'], { bg: string; icon: string }> = {
    success: { bg: '#00FF88', icon: '✅' },
    warning: { bg: '#FFD700', icon: '⚠️' },
    error: { bg: '#FF4444', icon: '❌' },
    info: { bg: '#00D4FF', icon: 'ℹ️' },
  };

  const c = colors[notification.type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#111827',
        border: `2px solid ${c.bg}`,
        borderRadius: '10px',
        padding: '15px 20px',
        maxWidth: '350px',
        zIndex: 9999,
        boxShadow: `0 0 30px ${c.bg}80`,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '24px' }}>{c.icon}</div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              color: c.bg,
              fontSize: '14px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {notification.title}
          </h3>
          <p
            style={{
              color: '#D1D5DB',
              fontSize: '12px',
              margin: 0,
              lineHeight: '1.4',
            }}
          >
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
