import { NavLink } from 'react-router-dom';
import { Home, Globe, Target, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/galaxy', icon: Globe, label: 'Galáxia' },
  { to: '/missions', icon: Target, label: 'Missões' },
  { to: '/leaderboard', icon: Trophy, label: 'Rank' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-bg-secondary/95 backdrop-blur-xl md:hidden">
      <ul className="flex items-center justify-around px-1 py-2">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-display font-bold tracking-wide transition-colors',
                  isActive ? 'text-neon-blue' : 'text-gray-500'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_currentColor]')}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
