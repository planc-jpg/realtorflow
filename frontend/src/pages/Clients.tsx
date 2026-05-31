// src/pages/Clients.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Mail, Phone, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusStyles = {
  Active:   'border-emerald-200 bg-emerald-50 text-emerald-700',
  Inactive: 'border-border bg-muted text-muted-foreground',
};

const typeStyles = {
  Buyer:  'border-sky-200 bg-sky-50 text-sky-700',
  Seller: 'border-violet-200 bg-violet-50 text-violet-700',
};

const avatarColors = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading clients...</p>;
  if (error) return <p className="text-sm text-destructive">Error: {error}</p>;

  return (
    <div>
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">Clients</h2>
          <p className="rf-page-subtitle">{clients.length} contacts</p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} />
          New Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="rf-empty-state">No clients yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client, index) => (
            <div key={client.id} className="rf-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[index % avatarColors.length]}`}>
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <Badge variant="outline" className={typeStyles[client.type]}>
                      {client.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusStyles[client.status]}>
                    {client.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(client)} className="rf-icon-button-muted">
                    <Pencil size={15} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmId(client.id)} className="rf-icon-button-danger">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
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
                <label className="rf-field-label">Name *</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Sarah Johnson" />
              </div>
              <div>
                <label className="rf-field-label">Email</label>
                <Input name="email" value={form.email} onChange={handleChange} placeholder="sarah@email.com" />
              </div>
              <div>
                <label className="rf-field-label">Phone</label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="(512) 555-0101" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="rf-field-label">Type</label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buyer">Buyer</SelectItem>
                      <SelectItem value="Seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="rf-field-label">Status</label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
