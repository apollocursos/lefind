import { startLogin } from "@/const";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

type UseAuthOptions = { redirectOnUnauthenticated?: boolean; redirectPath?: string };
type AuthUser = { id: number; openId: string; name: string | null; email: string | null; role: "user" | "admin" };

async function fetchMe(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", { credentials: "include" });
  if (!response.ok) return null;
  const payload = await response.json() as { user?: AuthUser | null };
  return payload.user ?? null;
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false, refetchOnWindowFocus: false });
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.setQueryData(["auth", "me"], null);
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  const user = meQuery.data ?? null;
  useEffect(() => {
    if (!redirectOnUnauthenticated || meQuery.isLoading || user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) window.location.href = redirectPath;
    else startLogin();
  }, [redirectOnUnauthenticated, redirectPath, meQuery.isLoading, user]);

  return { user, loading: meQuery.isLoading, error: meQuery.error ?? null, isAuthenticated: Boolean(user), refresh: () => meQuery.refetch(), logout };
}
