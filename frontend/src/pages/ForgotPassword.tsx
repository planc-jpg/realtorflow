import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSent(false);
    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={onSubmit}
        className="rf-card w-full max-w-sm space-y-4 p-6"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
        </div>

        <label className="block text-sm">
          <span className="text-foreground">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="mt-1"
          />
        </label>

        {sent && <p className="text-sm text-emerald-700">Check your email for a reset link</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={busy || !email.trim()} className="w-full">
          {busy ? 'Sending...' : 'Send reset link'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
