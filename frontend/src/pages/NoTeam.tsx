import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function NoTeam() {
  const { createTeam, acceptInvite, signOut } = useAuth();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [token, setToken]       = useState('');
  const [error, setError]       = useState(null);
  const [busy, setBusy]         = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-gray-200 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Set up your workspace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a team to start using RealtorFlow, or accept an invite if a teammate sent you one.
          </p>
        </div>

        <form onSubmit={onCreate} className="space-y-3">
          <label className="block text-sm">
            <span className="text-gray-700">Team name</span>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              placeholder="Acme Realty"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !teamName.trim()}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {busy ? 'Creating…' : 'Create team'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">or</span>
          </div>
        </div>

        <form onSubmit={onAccept} className="space-y-3">
          <label className="block text-sm">
            <span className="text-gray-700">Invite token</span>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your invite link"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !token.trim()}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Accept invite
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={signOut}
          className="block w-full text-center text-xs text-gray-400 hover:text-gray-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
