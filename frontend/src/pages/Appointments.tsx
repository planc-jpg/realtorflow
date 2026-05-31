// src/pages/Appointments.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { MapPin, Pencil, User, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const typeStyles = {
  Showing:      'bg-blue-100 text-blue-700',
  Consultation: 'bg-purple-100 text-purple-700',
  Closing:      'bg-green-100 text-green-700',
  'Follow Up':  'bg-amber-100 text-amber-700',
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

  if (loading) return <p className="text-sm text-gray-500">Loading appointments...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">{appointments.length} upcoming</p>
        </div>
        <Button onClick={openCreateModal}>
          + New Appointment
        </Button>
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
                          <Badge variant="outline" className={typeStyles[appt.type] || 'bg-gray-100 text-gray-500'}>
                            {appt.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {appt.client?.name && <span className="flex items-center gap-1"><User size={11} />{appt.client.name}</span>}
                          {appt.property?.address && <span className="flex items-center gap-1"><MapPin size={11} />{appt.property.address}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(appt)} className="text-gray-300 hover:text-blue-600">
                          <Pencil size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmId(appt.id)} className="text-gray-300 hover:text-red-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input name="title" value={form.title} onChange={handleChange} placeholder="Property Showing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>{clients.length === 0 ? 'No clients yet' : 'Select a client'}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select name="property_id" value={form.property_id} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>{properties.length === 0 ? 'No properties yet' : 'Select a property'}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.address}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input name="date" value={form.date} onChange={handleChange} placeholder="Mon, May 19" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input name="time" value={form.time} onChange={handleChange} placeholder="10:00 AM" />
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
