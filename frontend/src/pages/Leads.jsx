// src/pages/Leads.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Mail, Phone, Home, X, Trash2 } from 'lucide-react';

const statusStyles = {
  New:       'bg-blue-100 text-blue-700',
  Contacted: 'bg-amber-100 text-amber-700',
  Closed:    'bg-green-100 text-green-700',
};

const columns = ['New', 'Contacted', 'Closed'];
const emptyForm = { name: '', email: '', phone: '', property: '', status: 'New' };

export default function Leads() {
  const { activeTeamId } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchLeads(); }, [activeTeamId]);

  async function fetchLeads() {
    if (!activeTeamId) return;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('team_id', activeTeamId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setLeads(data);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!form.name || !activeTeamId) return;
    setSaving(true);
    const { error } = await supabase.from('leads').insert([{ ...form, team_id: activeTeamId }]);
    if (error) alert('Error: ' + error.message);
    else { setShowModal(false); setForm(emptyForm); fetchLeads(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchLeads();
  }

  if (loading) return <p className="text-sm text-gray-500">Loading leads...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} total leads</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col);
          return (
            <div key={col} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[col]}`}>
                  {col}
                </span>
                <span className="text-sm text-gray-400 font-medium">{colLeads.length}</span>
              </div>
              <div className="space-y-3">
                {colLeads.map((lead) => (
                  <div key={lead.id} className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                      <button onClick={() => handleDelete(lead.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      {lead.property && <div className="flex items-center gap-1.5"><Home size={12} /><span>{lead.property}</span></div>}
                      {lead.email && <div className="flex items-center gap-1.5"><Mail size={12} /><span>{lead.email}</span></div>}
                      {lead.phone && <div className="flex items-center gap-1.5"><Phone size={12} /><span>{lead.phone}</span></div>}
                    </div>
                  </div>
                ))}
                {colLeads.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No leads here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">New Lead</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Carlos Mendez" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="carlos@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="(512) 555-0121" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <input name="property" value={form.property} onChange={handleChange} placeholder="123 Maple Street" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving...' : 'Save Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}