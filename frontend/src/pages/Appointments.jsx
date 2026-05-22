// src/pages/Appointments.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { MapPin, User, X, Trash2 } from 'lucide-react';

const typeStyles = {
  Showing:      'bg-blue-100 text-blue-700',
  Consultation: 'bg-purple-100 text-purple-700',
  Closing:      'bg-green-100 text-green-700',
  'Follow Up':  'bg-amber-100 text-amber-700',
};

const emptyForm = { title: '', client: '', property: '', date: '', time: '', type: 'Showing' };

export default function Appointments() {
  const { activeTeamId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAppointments(); }, [activeTeamId]);

  async function fetchAppointments() {
    if (!activeTeamId) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('team_id', activeTeamId)
      .order('date', { ascending: true });
    if (error) setError(error.message);
    else setAppointments(data);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!form.title || !activeTeamId) return;
    setSaving(true);
    const { error } = await supabase.from('appointments').insert([{ ...form, team_id: activeTeamId }]);
    if (error) alert('Error: ' + error.message);
    else { setShowModal(false); setForm(emptyForm); fetchAppointments(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this appointment?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchAppointments();
  }

  const days = [...new Set(appointments.map((a) => a.date))];

  if (loading) return <p className="text-sm text-gray-500">Loading appointments...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">{appointments.length} upcoming</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-gray-400">No appointments yet.</p>
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">{day}</h3>
              <div className="space-y-3">
                {appointments
                  .filter((a) => a.date === day)
                  .map((appt) => (
                    <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                      <div className="w-20 text-center flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{appt.time}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm">{appt.title}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[appt.type] || 'bg-gray-100 text-gray-500'}`}>
                            {appt.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {appt.client && <span className="flex items-center gap-1"><User size={11} />{appt.client}</span>}
                          {appt.property && <span className="flex items-center gap-1"><MapPin size={11} />{appt.property}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(appt.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">New Appointment</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Property Showing" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input name="client" value={form.client} onChange={handleChange} placeholder="Sarah Johnson" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <input name="property" value={form.property} onChange={handleChange} placeholder="123 Maple Street" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" value={form.date} onChange={handleChange} placeholder="Mon, May 19" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input name="time" value={form.time} onChange={handleChange} placeholder="10:00 AM" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Showing</option>
                  <option>Consultation</option>
                  <option>Closing</option>
                  <option>Follow Up</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving...' : 'Save Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}