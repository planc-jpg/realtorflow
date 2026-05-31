import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { PENDING_INVITE_KEY } from '../auth/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      const pendingToken = sessionStorage.getItem(PENDING_INVITE_KEY);
      if (pendingToken) {
        sessionStorage.removeItem(PENDING_INVITE_KEY);
        navigate(`/accept-invite?token=${encodeURIComponent(pendingToken)}`, { replace: true });
        return;
      }
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={onSubmit}
        className="rf-card w-full max-w-sm p-6 space-y-4"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Sign in to RealtorFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">Use your work email and password.</p>
        </div>

        <label className="block text-sm">
          <span className="text-foreground">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1"
          />
        </label>

        <label className="block text-sm">
          <span className="text-foreground">Password</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1"
          />
        </label>

        <div className="-mt-2 text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-foreground hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Need an account?{' '}
          <Link to="/signup" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
