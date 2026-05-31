import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { PENDING_INVITE_KEY } from '../auth/constants';
import { Button } from '@/components/ui/button';

export default function AcceptInvite() {
  const { session, acceptInvite, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [status, setStatus] = useState(token ? 'idle' : 'missing');
  const [error, setError] = useState(null);

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
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rf-card w-full max-w-sm p-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Accept team invite</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You've been invited to join a team on RealtorFlow.
          </p>
        </div>

        {status === 'idle' && (
          <Button onClick={onAccept} className="w-full">
            Accept invite
          </Button>
        )}

        {status === 'working' && (
          <p className="text-sm text-muted-foreground">Accepting...</p>
        )}

        {status === 'done' && (
          <>
            <p className="text-sm text-emerald-700">You're in. Welcome to the team.</p>
            <Button onClick={() => navigate('/', { replace: true })} className="w-full">
              Go to dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={onAccept} className="w-full">
              Try again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
