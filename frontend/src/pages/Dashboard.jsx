import { Home, Users, UserPlus, CalendarDays } from 'lucide-react';
import StatCard from '../components/StatCard';

const stats = [
  { label: 'Properties',   value: 24, icon: Home,         color: 'blue'   },
  { label: 'Clients',      value: 89, icon: Users,        color: 'green'  },
  { label: 'Leads',        value: 12, icon: UserPlus,     color: 'amber'  },
  { label: 'Appointments', value: 5,  icon: CalendarDays, color: 'purple' },
];

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">Welcome back. Here's your overview.</p>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-400 text-center">
          More widgets coming soon.
        </p>
      </div>
    </div>
  );
}