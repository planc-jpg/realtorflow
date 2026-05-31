// src/pages/Leads.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Mail, Phone, Home, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusStyles = {
  New:       'border-sky-200 bg-sky-50 text-sky-700',
  Contacted: 'border-amber-200 bg-amber-50 text-amber-700',
  Closed:    'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const columns = ['New', 'Contacted', 'Closed'];
const emptyForm = { name: '', email: '', phone: '', property_id: '', status: 'New' };

export default function Leads() {
  const { activeTeamId } = useAuth();
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { fetchLeads(); }, [activeTeamId]);

  async function fetchLeads() {
    if (!activeTeamId) return;
    const [leadsResult, propertiesResult] = await Promise.all([
      supabase
        .from('leads')
        .select('*, property:properties(id, address)')
        .eq('team_id', activeTeamId)
        .order('created_at', { ascending: false }),
      supabase
        .from('properties')
        .select('id, address')
        .eq('team_id', activeTeamId)
        .order('address'),
    ]);

    if (leadsResult.error) setError(leadsResult.error.message);
    else setLeads(leadsResult.data);

    if (propertiesResult.error) setError(propertiesResult.error.message);
    else setProperties(propertiesResult.data ?? []);

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

  function openEditModal(lead) {
    setEditingItem(lead);
    setForm({
      name: lead.name ?? '',
      email: lead.email ?? '',
      phone: lead.phone ?? '',
      property_id: lead.property_id ?? '',
      status: lead.status ?? 'New',
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
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      status: form.status,
      property_id: form.property_id || null,
    };
    const { error } = editingItem
      ? await supabase.from('leads').update(payload).eq('id', editingItem.id)
      : await supabase.from('leads').insert([{ ...payload, team_id: activeTeamId }]);
    if (error) alert('Error: ' + error.message);
    else { closeModal(); fetchLeads(); }
    setSaving(false);
  }

  async function handleDelete() {
    const { error } = await supabase.from('leads').delete().eq('id', confirmId);
    if (error) alert('Error: ' + error.message);
    else fetchLeads();
    setConfirmId(null);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading leads...</p>;
  if (error) return <p className="text-sm text-destructive">Error: {error}</p>;

  return (
    <div>
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">Leads</h2>
          <p className="rf-page-subtitle">{leads.length} total leads</p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} />
          New Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col);
          return (
            <div key={col} className="rf-card p-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className={statusStyles[col]}>
                  {col}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground">{colLeads.length}</span>
              </div>
              <div className="space-y-3">
                {colLeads.map((lead) => (
                  <div key={lead.id} className="rounded-lg border border-border bg-muted/35 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-foreground text-sm">{lead.name}</p>
                      <div className="flex items-center gap-2 ml-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(lead)} className="rf-icon-button-muted">
                          <Pencil size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmId(lead.id)} className="rf-icon-button-danger">
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {lead.property?.address && <div className="flex items-center gap-1.5"><Home size={12} /><span>{lead.property.address}</span></div>}
                      {lead.email && <div className="flex items-center gap-1.5"><Mail size={12} /><span>{lead.email}</span></div>}
                      {lead.phone && <div className="flex items-center gap-1.5"><Phone size={12} /><span>{lead.phone}</span></div>}
                    </div>
                  </div>
                ))}
                {colLeads.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">No leads here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Lead' : 'New Lead'}</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="rf-field-label">Name *</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Carlos Mendez" />
              </div>
              <div>
                <label className="rf-field-label">Email</label>
                <Input name="email" value={form.email} onChange={handleChange} placeholder="carlos@email.com" />
              </div>
              <div>
                <label className="rf-field-label">Phone</label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="(512) 555-0121" />
              </div>
              <div>
                <label className="rf-field-label">Property</label>
                <select name="property_id" value={form.property_id} onChange={handleChange} className="rf-native-input">
                  <option value="" disabled>{properties.length === 0 ? 'No properties yet' : 'Select a property'}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.address}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="rf-field-label">Status</label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1">
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Lead'}
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {confirmId && (
        <ConfirmModal
          message="This lead will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
