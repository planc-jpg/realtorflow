import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NoTeam() {
  const { createTeam, acceptInvite, signOut } = useAuth();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onCreate(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await createTeam(teamName.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Could not create team');
    } finally {
      setBusy(false);
    }
  }

  async function onAccept(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await acceptInvite(token.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Could not accept invite');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rf-card w-full max-w-md p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Set up your workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a team to start using RealtorFlow, or accept an invite if a teammate sent you one.
          </p>
        </div>

        <form onSubmit={onCreate} className="space-y-3">
          <label className="block text-sm">
            <span className="text-foreground">Team name</span>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              placeholder="Acme Realty"
              className="mt-1"
            />
          </label>
          <Button type="submit" disabled={busy || !teamName.trim()} className="w-full">
            {busy ? 'Creating...' : 'Create team'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={onAccept} className="space-y-3">
          <label className="block text-sm">
            <span className="text-foreground">Invite token</span>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your invite link"
              className="mt-1"
            />
          </label>
          <Button type="submit" variant="outline" disabled={busy || !token.trim()} className="w-full">
            Accept invite
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="button"
          variant="ghost"
          onClick={signOut}
          className="w-full text-muted-foreground"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
