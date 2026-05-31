import { useCallback, useEffect, useState } from 'react';
import { Mail, Plus, Shield, Trash2, UserRound, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleStyles = {
  owner: 'border-sky-200 bg-sky-50 text-sky-700',
  admin: 'border-violet-200 bg-violet-50 text-violet-700',
  member: 'border-border bg-muted text-muted-foreground',
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading team...</p>;

  return (
    <div>
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">Team</h2>
          <p className="rf-page-subtitle">{activeTeam?.name ?? 'Current workspace'}</p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setInviteUrl('');
            setShowModal(true);
          }}
          className="gap-1.5"
        >
          <Plus size={16} />
          Invite Member
        </Button>
      </div>

      {error && !showModal && <p className="text-sm text-destructive mb-4">Error: {error}</p>}

      <div className="rf-card divide-y divide-border">
        {members.map((member) => {
          const name = member.profile?.full_name || (member.user_id === user?.id ? user.email : member.user_id);
          const isCurrentUser = member.user_id === user?.id;
          return (
            <div key={member.user_id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
                  <UserRound size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">Joined {formatDate(member.joined_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canManageMembers ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                    disabled={isCurrentUser || updatingUserId === member.user_id}
                    className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground disabled:bg-muted disabled:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/20"
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
                    className="rf-icon-button-danger"
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
          <div className="rf-card w-full max-w-md mx-4 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Invite Member</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <label className="block text-sm">
                <span className="text-foreground font-medium">Email</span>
                <div className="relative mt-1">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="teammate@email.com"
                    className="rf-native-input pl-9"
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="text-foreground font-medium">Role</span>
                <div className="relative mt-1">
                  <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

              {error && <p className="text-sm text-destructive">{error}</p>}
              {inviteUrl && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm font-medium text-emerald-700">Invite link copied</p>
                  <p className="mt-1 break-all text-xs text-emerald-700">{inviteUrl}</p>
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
