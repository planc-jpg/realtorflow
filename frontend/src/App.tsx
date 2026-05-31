import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import AIListing from './pages/AIListing';
import Appointments from './pages/Appointments';
import Team from './pages/Team';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import NoTeam from './pages/NoTeam';

function TeamGate({ children }) {
  const { teams, activeTeamId, loading } = useAuth();
  if (loading) return null;
  if (teams.length === 0 || !activeTeamId) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<PublicRoute><Login /></PublicRoute>}
          />
          <Route
            path="/signup"
            element={<PublicRoute><Signup /></PublicRoute>}
          />
          <Route
            path="/forgot-password"
            element={<PublicRoute><ForgotPassword /></PublicRoute>}
          />
          <Route
            path="/reset-password"
            element={<PublicRoute><ResetPassword /></PublicRoute>}
          />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route
            path="/welcome"
            element={<ProtectedRoute><NoTeam /></ProtectedRoute>}
          />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <TeamGate>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/"             element={<Dashboard />}    />
                      <Route path="/properties"   element={<Properties />}   />
                      <Route path="/properties/:id" element={<PropertyDetail />} />
                      <Route path="/clients"      element={<Clients />}      />
                      <Route path="/leads"        element={<Leads />}        />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/ai-listing"   element={<AIListing />}    />
                      <Route path="/team"         element={<Team />}         />
                    </Routes>
                  </DashboardLayout>
                </TeamGate>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
