import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Home, Mail, Phone, Pencil, Trash2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  sold: 'bg-gray-100 text-gray-500',
};

const emptyEditForm = { address: '', price: '', beds: '', baths: '', sqft: '', status: 'active' };

function formFromProperty(property) {
  return {
    address: property?.address ?? '',
    price: property?.price ?? '',
    beds: property?.beds ?? '',
    baths: property?.baths ?? '',
    sqft: property?.sqft ?? '',
    status: property?.status ?? 'active',
  };
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);

  const fetchPropertyDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [propertyResult, leadsResult, appointmentsResult] = await Promise.all([
      supabase.from('properties').select('*').eq('id', id).single(),
      supabase.from('leads').select('*').eq('property_id', id),
      supabase
        .from('appointments')
        .select('*, client:clients(id, name)')
        .eq('property_id', id)
        .order('date'),
    ]);

    if (propertyResult.error) {
      setError(propertyResult.error.message);
    } else {
      setProperty(propertyResult.data);
      setEditForm(formFromProperty(propertyResult.data));
    }

    if (leadsResult.error) setError(leadsResult.error.message);
    else setLeads(leadsResult.data ?? []);

    if (appointmentsResult.error) setError(appointmentsResult.error.message);
    else setAppointments(appointmentsResult.data ?? []);

    setLoading(false);
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPropertyDetail();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchPropertyDetail]);

  if (loading) return <p className="text-sm text-gray-500">Loading property...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;
  if (!property) return <p className="text-sm text-gray-500">Property not found.</p>;

  async function handleDelete() {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else navigate('/properties');
    setConfirmDelete(false);
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function cancelEdit() {
    setEditForm(formFromProperty(property));
    setEditMode(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      address: editForm.address,
      price: editForm.price === '' ? null : parseInt(editForm.price),
      beds: editForm.beds === '' ? null : parseInt(editForm.beds),
      baths: editForm.baths === '' ? null : parseInt(editForm.baths),
      sqft: editForm.sqft === '' ? null : parseInt(editForm.sqft),
      status: editForm.status,
    };

    const { error } = await supabase.from('properties').update(payload).eq('id', id);
    if (error) alert('Error saving property: ' + error.message);
    else {
      setEditMode(false);
      await fetchPropertyDetail();
    }
    setSaving(false);
  }

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => navigate('/properties')}
        className="mb-5 gap-2"
      >
        <ArrowLeft size={16} />
        Back to properties
      </Button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Home size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">{property.address}</h2>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {property.price ? `$${property.price.toLocaleString()}` : 'Price not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className={statusStyles[property.status] || 'bg-gray-100 text-gray-500'}>
              {property.status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditMode(true)}
              className="text-gray-300 hover:text-blue-600"
              aria-label="Edit property"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-red-500"
              aria-label="Delete property"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {editMode ? (
          <div className="border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input name="address" value={editForm.address} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input name="price" value={editForm.price} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input name="beds" value={editForm.beds} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input name="baths" value={editForm.baths} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                <input name="sqft" value={editForm.sqft} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" onClick={cancelEdit} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !editForm.address} className="flex-1">
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
            <span>{property.beds ?? '-'} beds</span>
            <span>{property.baths ?? '-'} baths</span>
            <span>{property.sqft ? property.sqft.toLocaleString() : '-'} sqft</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Leads</h3>
          {leads.length === 0 ? (
            <p className="text-sm text-gray-400">No linked leads yet.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {lead.email && <div className="flex items-center gap-1.5"><Mail size={12} /><span>{lead.email}</span></div>}
                    {lead.phone && <div className="flex items-center gap-1.5"><Phone size={12} /><span>{lead.phone}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-400">No linked appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      {appointment.type}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {appointment.client?.name && <div className="flex items-center gap-1.5"><User size={12} /><span>{appointment.client.name}</span></div>}
                    {(appointment.date || appointment.time) && (
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        <span>{[appointment.date, appointment.time].filter(Boolean).join(' at ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {confirmDelete && (
        <ConfirmModal
          message="This property will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
