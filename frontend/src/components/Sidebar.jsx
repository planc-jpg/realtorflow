import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, Users, UserPlus, CalendarDays, Sparkles } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/' },
  { label: 'Properties',   icon: Home,            to: '/properties' },
  { label: 'Clients',      icon: Users,           to: '/clients' },
  { label: 'Leads',        icon: UserPlus,        to: '/leads' },
  { label: 'Appointments', icon: CalendarDays,    to: '/appointments' },
  { label: 'AI Listing',   icon: Sparkles,        to: '/ai-listing' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">RealtorFlow</h1>
        <p className="text-xs text-gray-400 mt-0.5">Operations Dashboard</p>
      </div>
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
    </aside>
  );
}