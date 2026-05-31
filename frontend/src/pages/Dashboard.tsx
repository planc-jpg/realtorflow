// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Home, Users, UserPlus, CalendarDays } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const { activeTeamId } = useAuth();
  const [counts, setCounts] = useState({
    properties: 0,
    clients: 0,
    leads: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      if (!activeTeamId) return;
      const [properties, clients, leads, appointments] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('team_id', activeTeamId),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('team_id', activeTeamId),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('team_id', activeTeamId),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('team_id', activeTeamId),
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
  }, [activeTeamId]);

  const stats = [
    { label: 'Properties',   value: counts.properties,   icon: Home,         color: 'blue'   },
    { label: 'Clients',      value: counts.clients,      icon: Users,        color: 'green'  },
    { label: 'Leads',        value: counts.leads,        icon: UserPlus,     color: 'amber'  },
    { label: 'Appointments', value: counts.appointments, icon: CalendarDays, color: 'purple' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="rf-page-title">Dashboard</h2>
        <p className="rf-page-subtitle">Welcome back. Here's your overview.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="rf-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          More widgets coming soon.
        </p>
      </div>
    </div>
  );
}
