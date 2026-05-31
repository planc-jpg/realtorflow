// src/pages/Properties.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const statusStyles = {
  active:  'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  sold:    'bg-gray-100 text-gray-500',
};

const emptyForm = {
  address: '',
  price: '',
  beds: '',
  baths: '',
  sqft: '',
  status: 'active',
};

export default function Properties() {
  const { activeTeamId } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [activeTeamId]);

  async function fetchProperties() {
    if (!activeTeamId) return;
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('team_id', activeTeamId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProperties(data);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!form.address || !activeTeamId) return;
    setSaving(true);
    const { error } = await supabase.from('properties').insert([
      {
        address: form.address,
        price: form.price ? parseInt(form.price) : null,
        beds: form.beds ? parseInt(form.beds) : null,
        baths: form.baths ? parseInt(form.baths) : null,
        sqft: form.sqft ? parseInt(form.sqft) : null,
        status: form.status,
        team_id: activeTeamId,
      },
    ]);
    if (error) alert('Error saving property: ' + error.message);
    else { setShowModal(false); setForm(emptyForm); fetchProperties(); }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-gray-500">Loading properties...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-500 mt-0.5">{properties.length} listings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Property
        </button>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-gray-400">No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Link key={p.id} to={`/properties/${p.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Home size={18} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[p.status] || 'bg-gray-100 text-gray-500'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{p.address}</h3>
              <p className="text-lg font-semibold text-gray-900 mb-3">
                ${p.price?.toLocaleString()}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                <span>{p.beds} beds</span>
                <span>{p.baths} baths</span>
                {p.sqft && <span>{p.sqft?.toLocaleString()} sqft</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) setShowModal(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Property</DialogTitle>
          </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <Input name="address" value={form.address} onChange={handleChange} placeholder="123 Maple Street, Austin, TX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <Input name="price" value={form.price} onChange={handleChange} placeholder="450000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <Input name="beds" value={form.beds} onChange={handleChange} placeholder="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <Input name="baths" value={form.baths} onChange={handleChange} placeholder="2" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                <Input name="sqft" value={form.sqft} onChange={handleChange} placeholder="2100" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.address} className="flex-1">
                {saving ? 'Saving...' : 'Save Property'}
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
