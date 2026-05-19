// src/pages/Properties.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Home, MapPin } from 'lucide-react';

const statusStyles = {
  active:  'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  sold:    'bg-gray-100 text-gray-500',
};

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProperties(data);
      }

      setLoading(false);
    }

    fetchProperties();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading properties...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-500 mt-0.5">{properties.length} listings</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Property
        </button>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-gray-400">No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Home size={18} className="text-blue-600" />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[p.status] || 'bg-gray-100 text-gray-500'}`}>
                  {p.status}
                </span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}