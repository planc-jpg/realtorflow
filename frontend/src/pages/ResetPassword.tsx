import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords must match');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    setSuccess(true);
    setBusy(false);
    window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={onSubmit}
        className="rf-card w-full max-w-sm space-y-4 p-6"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter and confirm your new password.</p>
        </div>

        <label className="block text-sm">
          <span className="text-foreground">New password</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1"
          />
        </label>

        <label className="block text-sm">
          <span className="text-foreground">Confirm password</span>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1"
          />
        </label>

        {success && <p className="text-sm text-emerald-700">Password updated. Redirecting to login...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={busy || success} className="w-full">
          {busy ? 'Saving...' : 'Update password'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
