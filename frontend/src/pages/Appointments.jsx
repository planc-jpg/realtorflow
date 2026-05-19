// src/pages/Appointments.jsx

import { MapPin, User, Clock } from 'lucide-react';

const appointments = [
  { id: 1, title: 'Property Showing',  client: 'Sarah Johnson',  property: '123 Maple Street',  date: 'Mon, May 19', time: '10:00 AM', type: 'Showing'     },
  { id: 2, title: 'Listing Consult',   client: 'Mark Thompson',  property: '456 Oak Avenue',    date: 'Mon, May 19', time: '2:00 PM',  type: 'Consultation' },
  { id: 3, title: 'Property Showing',  client: 'Carlos Mendez',  property: '789 Pine Road',     date: 'Tue, May 20', time: '11:00 AM', type: 'Showing'      },
  { id: 4, title: 'Closing Meeting',   client: 'Nina Patel',     property: '654 Cedar Lane',    date: 'Tue, May 20', time: '3:00 PM',  type: 'Closing'      },
  { id: 5, title: 'Property Showing',  client: 'Eric Walsh',     property: '321 Elm Boulevard', date: 'Wed, May 21', time: '9:00 AM',  type: 'Showing'      },
  { id: 6, title: 'Follow Up Call',    client: 'Rachel Green',   property: '987 Birch Court',   date: 'Wed, May 21', time: '1:00 PM',  type: 'Follow Up'    },
];

const typeStyles = {
  Showing:      'bg-blue-100 text-blue-700',
  Consultation: 'bg-purple-100 text-purple-700',
  Closing:      'bg-green-100 text-green-700',
  'Follow Up':  'bg-amber-100 text-amber-700',
};

const days = [...new Set(appointments.map((a) => a.date))];

export default function Appointments() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">{appointments.length} upcoming</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Appointment
        </button>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day}>
            {/* Day header */}
            <h3 className="text-sm font-medium text-gray-500 mb-3">{day}</h3>

            {/* Appointments for this day */}
            <div className="space-y-3">
              {appointments
                .filter((a) => a.date === day)
                .map((appt) => (
                  <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    {/* Time */}
                    <div className="w-20 text-center flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{appt.time}</p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">{appt.title}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[appt.type]}`}>
                          {appt.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {appt.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {appt.property}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}