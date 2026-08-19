import { Menu, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bg-secondary/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar lições, planetas..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none focus:shadow-neon-blue"
          />
        </div>

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-neon-pink shadow-neon-pink" />
          </button>

          {user && (
            <div className="flex items-center gap-3 border-l border-white/10 pl-3">
              <Avatar
                fallback={user.username}
                ring
                ringColor="blue"
                size="sm"
                className="hidden sm:flex"
              />
              <Button variant="ghost" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
