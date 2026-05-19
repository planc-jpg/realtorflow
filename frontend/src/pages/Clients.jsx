// src/pages/Clients.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, X, Trash2 } from 'lucide-react';

const statusStyles = {
  Active:   'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

const typeStyles = {
  Buyer:  'bg-blue-50 text-blue-600',
  Seller: 'bg-purple-50 text-purple-600',
};

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

const emptyForm = { name: '', email: '', phone: '', type: 'Buyer', status: 'Active' };

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setClients(data);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    const { error } = await supabase.from('clients').insert([form]);
    if (error) alert('Error: ' + error.message);
    else { setShowModal(false); setForm(emptyForm); fetchClients(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchClients();
  }

  if (loading) return <p className="text-sm text-gray-500">Loading clients...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} contacts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-400">No clients yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client, index) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[index % avatarColors.length]}`}>
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[client.type]}`}>
                      {client.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[client.status]}`}>
                    {client.status}
                  </span>
                  <button onClick={() => handleDelete(client.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Mail size={14} /><span>{client.email}</span></div>
                <div className="flex items-center gap-2"><Phone size={14} /><span>{client.phone}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">New Client</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Sarah Johnson" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="sarah@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="(512) 555-0101" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Buyer</option>
                    <option>Seller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}