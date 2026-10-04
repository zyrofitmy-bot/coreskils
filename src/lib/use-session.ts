import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SessionRole = "student" | "creator" | "admin";

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: SessionRole;
  avatarUrl: string | null;
};

export type SessionData = {
  authenticated: boolean;
  user: SessionUser | null;
};

function pickRole(roles: string[]): SessionRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("creator")) return "creator";
  return "student";
}

async function loadSession(): Promise<SessionData> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { authenticated: false, user: null };
  }

  const authUser = session.user;

  const [{ data: profile }, { data: userRoles }] = await Promise.all([
    supabase.from("profiles").select("name, avatar_url").eq("id", authUser.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", authUser.id),
  ]);

  const role = pickRole((userRoles ?? []).map((r) => r.role));

  return {
    authenticated: true,
    user: {
      id: authUser.id,
      email: authUser.email ?? null,
      name: profile?.name ?? null,
      role,
      avatarUrl: profile?.avatar_url ?? null,
    },
  };
}

export function useGetSession() {
  const [data, setData] = useState<SessionData | undefined>(undefined);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadSession()
      .then((result) => {
        if (mounted) {
          setData(result);
          setIsPending(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData({ authenticated: false, user: null });
          setIsPending(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setIsPending(true);
      loadSession()
        .then((result) => {
          if (mounted) {
            setData(result);
            setIsPending(false);
          }
        })
        .catch(() => {
          if (mounted) {
            setData({ authenticated: false, user: null });
            setIsPending(false);
          }
        });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { data, isPending, isLoading: isPending };
}

export async function logout() {
  await supabase.auth.signOut();
}
