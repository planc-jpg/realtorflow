// src/pages/Leads.jsx

import { Mail, Phone, Home } from 'lucide-react';

const leads = [
  { id: 1, name: 'Carlos Mendez',   email: 'c.mendez@email.com',  phone: '(512) 555-0121', property: '123 Maple Street',  status: 'New'       },
  { id: 2, name: 'Rachel Green',    email: 'r.green@email.com',   phone: '(214) 555-0155', property: '456 Oak Avenue',    status: 'Contacted' },
  { id: 3, name: 'Tom Bradley',     email: 't.bradley@email.com', phone: '(713) 555-0177', property: '789 Pine Road',     status: 'Contacted' },
  { id: 4, name: 'Nina Patel',      email: 'n.patel@email.com',   phone: '(210) 555-0189', property: '654 Cedar Lane',    status: 'Closed'    },
  { id: 5, name: 'Eric Walsh',      email: 'e.walsh@email.com',   phone: '(512) 555-0144', property: '321 Elm Boulevard', status: 'New'       },
  { id: 6, name: 'Monica Torres',   email: 'm.torres@email.com',  phone: '(214) 555-0166', property: '987 Birch Court',   status: 'Closed'    },
];

const statusStyles = {
  New:       'bg-blue-100 text-blue-700',
  Contacted: 'bg-amber-100 text-amber-700',
  Closed:    'bg-green-100 text-green-700',
};

const columns = ['New', 'Contacted', 'Closed'];

export default function Leads() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} total leads</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Lead
        </button>
      </div>

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col);
          return (
            <div key={col} className="bg-white rounded-xl border border-gray-200 p-4">
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[col]}`}>
                    {col}
                  </span>
                </div>
                <span className="text-sm text-gray-400 font-medium">{colLeads.length}</span>
              </div>

              {/* Lead cards */}
              <div className="space-y-3">
                {colLeads.map((lead) => (
                  <div key={lead.id} className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                    <p className="font-medium text-gray-900 text-sm mb-2">{lead.name}</p>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Home size={12} />
                        <span>{lead.property}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No leads here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}