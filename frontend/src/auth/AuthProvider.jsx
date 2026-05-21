import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

const PENDING_INVITE_KEY = 'rf.pendingInviteToken';

export function AuthProvider({ children }) {
  const [session, setSession]           = useState(null);
  const [profile, setProfile]           = useState(null);
  const [teams, setTeams]               = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [loading, setLoading]           = useState(true);

  const userId = session?.user?.id ?? null;
  const lastLoadedUserId = useRef(null);

  // ── session bootstrap + listener ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      if (!data.session) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      if (!next) {
        setProfile(null);
        setTeams([]);
        setActiveTeamId(null);
        lastLoadedUserId.current = null;
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ── load profile + teams whenever the user changes ──────────────────────
  const loadProfileAndTeams = useCallback(async (uid) => {
    setLoading(true);
    try {
      const [{ data: profileRow, error: profileErr }, { data: memberRows, error: memberErr }] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
          supabase
            .from('team_members')
            .select('role, joined_at, team:teams(id, name, slug, created_at)')
            .eq('user_id', uid),
        ]);

      if (profileErr) throw profileErr;
      if (memberErr) throw memberErr;

      const memberships = (memberRows ?? [])
        .filter((row) => row.team)
        .map((row) => ({
          id:        row.team.id,
          name:      row.team.name,
          slug:      row.team.slug,
          role:      row.role,
          joined_at: row.joined_at,
        }));

      setProfile(profileRow ?? null);
      setTeams(memberships);

      const last = profileRow?.last_team_id;
      const next =
        memberships.find((t) => t.id === last)?.id ??
        memberships[0]?.id ??
        null;
      setActiveTeamId(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (lastLoadedUserId.current === userId) return;
    lastLoadedUserId.current = userId;
    loadProfileAndTeams(userId);
  }, [userId, loadProfileAndTeams]);

  // ── actions ─────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName ?? '' } },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshTeams = useCallback(async () => {
    if (userId) await loadProfileAndTeams(userId);
  }, [userId, loadProfileAndTeams]);

  const setActiveTeam = useCallback(async (teamId) => {
    setActiveTeamId(teamId);
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ last_team_id: teamId })
      .eq('id', userId);
  }, [userId]);

  const acceptInvite = useCallback(async (token) => {
    const { data, error } = await supabase.rpc('accept_invite', { _token: token });
    if (error) throw error;
    if (userId) await loadProfileAndTeams(userId);
    if (data) setActiveTeamId(data);
    return data;
  }, [userId, loadProfileAndTeams]);

  const createTeam = useCallback(async (name) => {
    if (!userId) throw new Error('not authenticated');
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, slug, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    await loadProfileAndTeams(userId);
    setActiveTeamId(data.id);
    return data;
  }, [userId, loadProfileAndTeams]);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    teams,
    activeTeamId,
    activeTeam: teams.find((t) => t.id === activeTeamId) ?? null,
    loading,
    signIn,
    signUp,
    signOut,
    setActiveTeam,
    refreshTeams,
    acceptInvite,
    createTeam,
  }), [session, profile, teams, activeTeamId, loading, signIn, signUp, signOut, setActiveTeam, refreshTeams, acceptInvite, createTeam]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { PENDING_INVITE_KEY };
