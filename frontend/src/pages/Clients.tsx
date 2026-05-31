// src/pages/Clients.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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
  const { activeTeamId } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { fetchClients(); }, [activeTeamId]);

  async function fetchClients() {
    if (!activeTeamId) return;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('team_id', activeTeamId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setClients(data);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(client) {
    setEditingItem(client);
    setForm({
      name: client.name ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      type: client.type ?? 'Buyer',
      status: client.status ?? 'Active',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.name || !activeTeamId) return;
    setSaving(true);
    const { error } = editingItem
      ? await supabase.from('clients').update(form).eq('id', editingItem.id)
      : await supabase.from('clients').insert([{ ...form, team_id: activeTeamId }]);
    if (error) alert('Error: ' + error.message);
    else { closeModal(); fetchClients(); }
    setSaving(false);
  }

  async function handleDelete() {
    const { error } = await supabase.from('clients').delete().eq('id', confirmId);
    if (error) alert('Error: ' + error.message);
    else fetchClients();
    setConfirmId(null);
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
        <Button onClick={openCreateModal}>
          + New Client
        </Button>
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
                    <Badge variant="outline" className={typeStyles[client.type]}>
                      {client.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusStyles[client.status]}>
                    {client.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(client)} className="text-gray-300 hover:text-blue-600">
                    <Pencil size={15} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmId(client.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </Button>
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

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Client' : 'New Client'}</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Sarah Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input name="email" value={form.email} onChange={handleChange} placeholder="sarah@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="(512) 555-0101" />
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
              <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1">
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Client'}
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {confirmId && (
        <ConfirmModal
          message="This client will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
