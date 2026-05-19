import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Clients from './pages/Clients';
import Leads from './pages/Leads';

function Appointments(){ return <h2 className="text-xl font-semibold">Appointments</h2>; }

export default function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/"             element={<Dashboard />}     />
          <Route path="/properties"   element={<Properties />}    />
          <Route path="/clients"      element={<Clients />}       />
          <Route path="/leads"        element={<Leads />}         />
          <Route path="/appointments" element={<Appointments />}  />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}