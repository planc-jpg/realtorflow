// src/pages/Properties.jsx

import { Home, MapPin } from 'lucide-react';

const properties = [
  { id: 1, address: '123 Maple Street',    city: 'Austin, TX',      price: '$450,000', beds: 3, baths: 2, status: 'Active'  },
  { id: 2, address: '456 Oak Avenue',      city: 'Dallas, TX',      price: '$320,000', beds: 2, baths: 1, status: 'Pending' },
  { id: 3, address: '789 Pine Road',       city: 'Houston, TX',     price: '$580,000', beds: 4, baths: 3, status: 'Active'  },
  { id: 4, address: '321 Elm Boulevard',   city: 'San Antonio, TX', price: '$275,000', beds: 2, baths: 2, status: 'Sold'    },
  { id: 5, address: '654 Cedar Lane',      city: 'Austin, TX',      price: '$710,000', beds: 5, baths: 4, status: 'Active'  },
  { id: 6, address: '987 Birch Court',     city: 'Dallas, TX',      price: '$395,000', beds: 3, baths: 2, status: 'Pending' },
];

const statusStyles = {
  Active:  'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Sold:    'bg-gray-100 text-gray-500',
};

export default function Properties() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Home size={18} className="text-blue-600" />
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[p.status]}`}>
                {p.status}
              </span>
            </div>

            <h3 className="font-medium text-gray-900 mb-1">{p.address}</h3>

            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <MapPin size={13} />
              {p.city}
            </div>

            <p className="text-lg font-semibold text-gray-900 mb-3">{p.price}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
              <span>{p.beds} beds</span>
              <span>{p.baths} baths</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}