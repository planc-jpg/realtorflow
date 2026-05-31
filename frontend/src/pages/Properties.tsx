// src/pages/Properties.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { Home, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusStyles = {
  active:  'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  sold:    'border-border bg-muted text-muted-foreground',
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading properties...</p>;
  if (error) return <p className="text-sm text-destructive">Error: {error}</p>;

  return (
    <div>
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">Properties</h2>
          <p className="rf-page-subtitle">{properties.length} listings</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-1.5"
        >
          <Plus size={16} />
          New Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="rf-empty-state">No properties found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Link key={p.id} to={`/properties/${p.id}`} className="rf-card block p-5 transition hover:border-ring/30 hover:shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Home size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusStyles[p.status] || 'border-border bg-muted text-muted-foreground'}>
                    {p.status}
                  </Badge>
                </div>
              </div>
              <h3 className="font-medium text-foreground mb-1">{p.address}</h3>
              <p className="text-lg font-semibold tracking-tight text-foreground mb-3">
                ${p.price?.toLocaleString()}
              </p>
              <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
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
                <label className="rf-field-label">Address *</label>
                <Input name="address" value={form.address} onChange={handleChange} placeholder="123 Maple Street, Austin, TX" />
              </div>
              <div>
                <label className="rf-field-label">Price</label>
                <Input name="price" value={form.price} onChange={handleChange} placeholder="450000" />
              </div>
              <div>
                <label className="rf-field-label">Status</label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="rf-field-label">Bedrooms</label>
                <Input name="beds" value={form.beds} onChange={handleChange} placeholder="3" />
              </div>
              <div>
                <label className="rf-field-label">Bathrooms</label>
                <Input name="baths" value={form.baths} onChange={handleChange} placeholder="2" />
              </div>
              <div className="col-span-2">
                <label className="rf-field-label">Square Footage</label>
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
