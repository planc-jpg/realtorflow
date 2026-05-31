// src/pages/Appointments.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { MapPin, Pencil, Plus, User, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const typeStyles = {
  Showing:      'border-sky-200 bg-sky-50 text-sky-700',
  Consultation: 'border-violet-200 bg-violet-50 text-violet-700',
  Closing:      'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Follow Up':  'border-amber-200 bg-amber-50 text-amber-700',
};

const emptyForm = { title: '', client_id: '', property_id: '', date: '', time: '', type: 'Showing' };

export default function Appointments() {
  const { activeTeamId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { fetchAppointments(); }, [activeTeamId]);

  async function fetchAppointments() {
    if (!activeTeamId) return;
    const [appointmentsResult, propertiesResult, clientsResult] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, property:properties(id, address), client:clients(id, name)')
        .eq('team_id', activeTeamId)
        .order('date', { ascending: true }),
      supabase
        .from('properties')
        .select('id, address')
        .eq('team_id', activeTeamId)
        .order('address'),
      supabase
        .from('clients')
        .select('id, name')
        .eq('team_id', activeTeamId)
        .order('name'),
    ]);

    if (appointmentsResult.error) setError(appointmentsResult.error.message);
    else setAppointments(appointmentsResult.data);

    if (propertiesResult.error) setError(propertiesResult.error.message);
    else setProperties(propertiesResult.data ?? []);

    if (clientsResult.error) setError(clientsResult.error.message);
    else setClients(clientsResult.data ?? []);

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

  function openEditModal(appointment) {
    setEditingItem(appointment);
    setForm({
      title: appointment.title ?? '',
      client_id: appointment.client_id ?? '',
      property_id: appointment.property_id ?? '',
      date: appointment.date ?? '',
      time: appointment.time ?? '',
      type: appointment.type ?? 'Showing',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title || !activeTeamId) return;
    setSaving(true);
    const payload = {
      title: form.title,
      date: form.date,
      time: form.time,
      type: form.type,
      client_id: form.client_id || null,
      property_id: form.property_id || null,
    };
    const { error } = editingItem
      ? await supabase.from('appointments').update(payload).eq('id', editingItem.id)
      : await supabase.from('appointments').insert([{ ...payload, team_id: activeTeamId }]);
    if (error) alert('Error: ' + error.message);
    else { closeModal(); fetchAppointments(); }
    setSaving(false);
  }

  async function handleDelete() {
    const { error } = await supabase.from('appointments').delete().eq('id', confirmId);
    if (error) alert('Error: ' + error.message);
    else fetchAppointments();
    setConfirmId(null);
  }

  const days = [...new Set(appointments.map((a) => a.date))];

  if (loading) return <p className="text-sm text-muted-foreground">Loading appointments...</p>;
  if (error) return <p className="text-sm text-destructive">Error: {error}</p>;

  return (
    <div>
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">Appointments</h2>
          <p className="rf-page-subtitle">{appointments.length} upcoming</p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} />
          New Appointment
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="rf-empty-state">No appointments yet.</div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{day}</h3>
              <div className="space-y-3">
                {appointments
                  .filter((a) => a.date === day)
                  .map((appt) => (
                    <div key={appt.id} className="rf-card flex items-center gap-4 p-4">
                      <div className="w-20 text-center flex-shrink-0">
                        <p className="text-sm font-semibold text-foreground">{appt.time}</p>
                      </div>
                      <div className="w-px h-10 bg-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground text-sm">{appt.title}</p>
                          <Badge variant="outline" className={typeStyles[appt.type] || 'border-border bg-muted text-muted-foreground'}>
                            {appt.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {appt.client?.name && <span className="flex items-center gap-1"><User size={11} />{appt.client.name}</span>}
                          {appt.property?.address && <span className="flex items-center gap-1"><MapPin size={11} />{appt.property.address}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(appt)} className="rf-icon-button-muted">
                          <Pencil size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmId(appt.id)} className="rf-icon-button-danger">
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="rf-field-label">Title *</label>
                <Input name="title" value={form.title} onChange={handleChange} placeholder="Property Showing" />
              </div>
              <div>
                <label className="rf-field-label">Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange} className="rf-native-input">
                  <option value="" disabled>{clients.length === 0 ? 'No clients yet' : 'Select a client'}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="rf-field-label">Date</label>
                  <Input name="date" value={form.date} onChange={handleChange} placeholder="Mon, May 19" />
                </div>
                <div>
                  <label className="rf-field-label">Time</label>
                  <Input name="time" value={form.time} onChange={handleChange} placeholder="10:00 AM" />
                </div>
              </div>
              <div>
                <label className="rf-field-label">Type</label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Showing">Showing</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Closing">Closing</SelectItem>
                    <SelectItem value="Follow Up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title} className="flex-1">
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Appointment'}
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {confirmId && (
        <ConfirmModal
          message="This appointment will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
