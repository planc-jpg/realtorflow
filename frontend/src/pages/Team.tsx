import { useCallback, useEffect, useState } from 'react';
import { Mail, Shield, Trash2, UserRound, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleStyles = {
  owner: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
  member: 'bg-gray-100 text-gray-600',
};

const emptyForm = { email: '', role: 'member' };

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function Team() {
  const { activeTeamId, activeTeam, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [confirmUserId, setConfirmUserId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const currentMember = members.find((member) => member.user_id === user?.id);
  const canManageMembers = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const fetchMembers = useCallback(async () => {
    if (!activeTeamId) return;

    const { data: memberRows, error: memberError } = await supabase
      .from('team_members')
      .select('user_id, role, joined_at')
      .eq('team_id', activeTeamId)
      .order('joined_at', { ascending: true });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    const userIds = (memberRows ?? []).map((member) => member.user_id);
    const { data: profileRows, error: profileError } = userIds.length
      ? await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)
      : { data: [], error: null };

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const profilesById = new Map((profileRows ?? []).map((profile) => [profile.id, profile]));
    setMembers((memberRows ?? []).map((member) => ({
      ...member,
      profile: profilesById.get(member.user_id) ?? null,
    })));
    setLoading(false);
  }, [activeTeamId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchMembers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMembers]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!activeTeamId || !form.email.trim()) return;

    setSaving(true);
    setError(null);
    setInviteUrl('');

    const { data: token, error } = await supabase.rpc('create_invite', {
      team_id: activeTeamId,
      email: form.email.trim(),
      role: form.role,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    const url = `${window.location.origin}/accept-invite?token=${encodeURIComponent(token)}`;
    setInviteUrl(url);

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setError('Invite created, but copying to clipboard failed.');
    }

    setForm(emptyForm);
    setSaving(false);
  }

  async function handleRoleChange(memberId, role) {
    if (!activeTeamId) return;
    setUpdatingUserId(memberId);
    setError(null);

    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', activeTeamId)
      .eq('user_id', memberId);

    if (error) setError(error.message);
    else await fetchMembers();
    setUpdatingUserId(null);
  }

  async function handleRemoveMember() {
    if (!activeTeamId || !confirmUserId) return;
    setError(null);

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', activeTeamId)
      .eq('user_id', confirmUserId);

    if (error) setError(error.message);
    else await fetchMembers();
    setConfirmUserId(null);
  }

  if (loading) return <p className="text-sm text-gray-500">Loading team...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">{activeTeam?.name ?? 'Current workspace'}</p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setInviteUrl('');
            setShowModal(true);
          }}
        >
          Invite Member
        </Button>
      </div>

      {error && !showModal && <p className="text-sm text-red-500 mb-4">Error: {error}</p>}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {members.map((member) => {
          const name = member.profile?.full_name || (member.user_id === user?.id ? user.email : member.user_id);
          const isCurrentUser = member.user_id === user?.id;
          return (
            <div key={member.user_id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <UserRound size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500">Joined {formatDate(member.joined_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canManageMembers ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                    disabled={isCurrentUser || updatingUserId === member.user_id}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                    <option value="owner">owner</option>
                  </select>
                ) : (
                  <Badge variant="outline" className={roleStyles[member.role] ?? roleStyles.member}>
                    {member.role}
                  </Badge>
                )}
                {canManageMembers && !isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmUserId(member.user_id)}
                    className="text-gray-300 hover:text-red-500"
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Invite Member</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </Button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Email</span>
                <div className="relative mt-1">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="teammate@email.com"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Role</span>
                <div className="relative mt-1">
                  <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                    <SelectTrigger className="w-full pl-9">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {inviteUrl && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-700">Invite link copied</p>
                  <p className="mt-1 break-all text-xs text-green-700">{inviteUrl}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !form.email.trim()}
                  className="flex-1"
                >
                  {saving ? 'Creating...' : 'Create Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmUserId && (
        <ConfirmModal
          message="This member will be removed from the team."
          onConfirm={handleRemoveMember}
          onCancel={() => setConfirmUserId(null)}
        />
      )}
    </div>
  );
}
