// src/pages/Clients.jsx

import { Mail, Phone } from 'lucide-react';

const clients = [
  { id: 1, name: 'Sarah Johnson',  email: 'sarah.j@email.com',    phone: '(512) 555-0101', type: 'Buyer',  status: 'Active'   },
  { id: 2, name: 'Mark Thompson',  email: 'mark.t@email.com',     phone: '(214) 555-0182', type: 'Seller', status: 'Active'   },
  { id: 3, name: 'Lisa Chen',      email: 'lisa.chen@email.com',  phone: '(713) 555-0143', type: 'Buyer',  status: 'Inactive' },
  { id: 4, name: 'James Rivera',   email: 'j.rivera@email.com',   phone: '(210) 555-0167', type: 'Seller', status: 'Active'   },
  { id: 5, name: 'Amanda Foster',  email: 'a.foster@email.com',   phone: '(512) 555-0198', type: 'Buyer',  status: 'Active'   },
  { id: 6, name: 'David Kim',      email: 'david.k@email.com',    phone: '(214) 555-0134', type: 'Buyer',  status: 'Inactive' },
];

const statusStyles = {
  Active:   'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

const typeStyles = {
  Buyer:  'bg-blue-50 text-blue-600',
  Seller: 'bg-purple-50 text-purple-600',
};

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

export default function Clients() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} contacts</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map((client, index) => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(client.name)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[client.type]}`}>
                    {client.type}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[client.status]}`}>
                {client.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>{client.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}