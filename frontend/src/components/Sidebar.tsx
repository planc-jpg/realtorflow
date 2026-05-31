import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, Users, UserPlus, CalendarDays, Sparkles, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/' },
  { label: 'Properties',   icon: Home,            to: '/properties' },
  { label: 'Clients',      icon: Users,           to: '/clients' },
  { label: 'Leads',        icon: UserPlus,        to: '/leads' },
  { label: 'Appointments', icon: CalendarDays,    to: '/appointments' },
  { label: 'AI Listing',   icon: Sparkles,        to: '/ai-listing' },
  { label: 'Team',         icon: Settings,        to: '/team' },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user, teams, activeTeamId, activeTeam, setActiveTeam, signOut } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-5 py-5 border-b border-sidebar-border">
        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">RealtorFlow</h1>
        <p className="text-xs text-muted-foreground mt-1">Operations dashboard</p>
      </div>

      {teams.length > 0 && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <label className="block">
            <span className="block px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5">Team</span>
            {teams.length > 1 ? (
              <select
                value={activeTeamId ?? ''}
                onChange={(e) => setActiveTeam(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-sm text-foreground shadow-xs transition-colors focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/20"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <p className="rounded-lg border border-transparent px-2.5 py-2 text-sm font-medium text-foreground truncate">{activeTeam?.name}</p>
            )}
          </label>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
              }`
            }
          >
            <Icon size={17} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border">
        <p className="px-2 text-xs text-muted-foreground truncate" title={user?.email ?? ''}>
          {user?.email ?? ''}
        </p>
        <div className="mt-2 flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={signOut}
            className="flex-1 justify-start gap-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut size={16} />
            Sign out
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
