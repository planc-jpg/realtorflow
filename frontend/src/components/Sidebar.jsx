import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, Users, UserPlus, CalendarDays, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/' },
  { label: 'Properties',   icon: Home,            to: '/properties' },
  { label: 'Clients',      icon: Users,           to: '/clients' },
  { label: 'Leads',        icon: UserPlus,        to: '/leads' },
  { label: 'Appointments', icon: CalendarDays,    to: '/appointments' },
  { label: 'AI Listing',   icon: Sparkles,        to: '/ai-listing' },
];

export default function Sidebar() {
  const { user, teams, activeTeamId, activeTeam, setActiveTeam, signOut } = useAuth();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">RealtorFlow</h1>
        <p className="text-xs text-gray-400 mt-0.5">Operations Dashboard</p>
      </div>

      {teams.length > 0 && (
        <div className="px-3 py-3 border-b border-gray-200">
          <label className="block">
            <span className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1">Team</span>
            {teams.length > 1 ? (
              <select
                value={activeTeamId ?? ''}
                onChange={(e) => setActiveTeam(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-700 truncate">{activeTeam?.name}</p>
            )}
          </label>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-200">
        <p className="px-2 text-xs text-gray-500 truncate" title={user?.email ?? ''}>
          {user?.email ?? ''}
        </p>
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
