import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { PENDING_INVITE_KEY } from '../auth/AuthProvider';

export default function AcceptInvite() {
  const { session, acceptInvite, loading } = useAuth();
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token');

  const [status, setStatus] = useState(token ? 'idle' : 'missing');
  const [error, setError]   = useState(null);

  // If the user isn't authenticated yet, stash the token and bounce to login.
  useEffect(() => {
    if (loading || !token) return;
    if (!session) {
      sessionStorage.setItem(PENDING_INVITE_KEY, token);
      navigate('/login', { replace: true, state: { from: `/accept-invite?token=${encodeURIComponent(token)}` } });
    }
  }, [loading, session, token, navigate]);

  async function onAccept() {
    setStatus('working');
    setError(null);
    try {
      await acceptInvite(token);
      setStatus('done');
    } catch (err) {
      setError(err.message ?? 'Could not accept invite');
      setStatus('error');
    }
  }

  if (!token) return <Navigate to="/" replace />;
  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">Accept team invite</h1>
        <p className="text-sm text-gray-500">
          You've been invited to join a team on RealtorFlow.
        </p>

        {status === 'idle' && (
          <button
            onClick={onAccept}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Accept invite
          </button>
        )}

        {status === 'working' && (
          <p className="text-sm text-gray-500">Accepting…</p>
        )}

        {status === 'done' && (
          <>
            <p className="text-sm text-green-600">You're in. Welcome to the team.</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={onAccept}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
