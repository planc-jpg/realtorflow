// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Home, Users, UserPlus, CalendarDays } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    properties: 0,
    clients: 0,
    leads: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const [properties, clients, leads, appointments] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
      ]);

      setCounts({
        properties: properties.count || 0,
        clients: clients.count || 0,
        leads: leads.count || 0,
        appointments: appointments.count || 0,
      });
      setLoading(false);
    }

    fetchCounts();
  }, []);

  const stats = [
    { label: 'Properties',   value: counts.properties,   icon: Home,         color: 'blue'   },
    { label: 'Clients',      value: counts.clients,      icon: Users,        color: 'green'  },
    { label: 'Leads',        value: counts.leads,        icon: UserPlus,     color: 'amber'  },
    { label: 'Appointments', value: counts.appointments, icon: CalendarDays, color: 'purple' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">Welcome back. Here's your overview.</p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-400 text-center">
          More widgets coming soon.
        </p>
      </div>
    </div>
  );
}