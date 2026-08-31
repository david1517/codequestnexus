import { NavLink } from 'react-router-dom';
import { Home, Globe, Target, Award, User, Settings, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export function Sidebar() {
  const { user } = useAuthStore();

  const items = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/galaxy', icon: Globe, label: 'Galaxia' },
    { to: '/missions', icon: Target, label: 'Missoes' },
    { to: '/achievements', icon: Award, label: 'Conquistas' },
    { to: '/profile', icon: User, label: 'Perfil' },
    { to: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '250px',
        background: '#0A1020',
        borderRight: '1px solid #1F2937',
        padding: '20px',
        color: 'white',
        fontFamily: 'sans-serif',
        zIndex: 50,
      }}
      className="sidebar"
    >
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={20} color="white" fill="white" />
          </div>

          <div>
            <h1
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              CODEQUEST
            </h1>

            <p
              style={{
                fontSize: '10px',
                color: '#00D4FF',
                letterSpacing: '2px',
                margin: 0,
              }}
            >
              NEXUS
            </p>
          </div>
        </div>
      </div>

      {user && (
        <div
          style={{
            padding: '15px',
            background: '#111827',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            {user.username[0].toUpperCase()}
          </div>

          <p
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {user.username}
          </p>

          <p
            style={{
              fontSize: '11px',
              color: '#9CA3AF',
            }}
          >
            Nivel {user.level}
          </p>
        </div>
      )}

      <nav>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 15px',
              marginBottom: '5px',
              borderRadius: '8px',
              background: isActive ? '#1F2937' : 'transparent',
              color: isActive ? '#00D4FF' : '#9CA3AF',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 'bold' : 'normal',
              borderLeft: isActive
                ? '3px solid #00D4FF'
                : '3px solid transparent',
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}