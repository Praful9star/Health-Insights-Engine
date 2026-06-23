import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export type Tier = "free" | "premium" | "family";

export interface Entitlement {
  tier: Tier;
  max_profiles: number;
  current_period_end: string | null;
}

const FREE: Entitlement = { tier: "free", max_profiles: 1, current_period_end: null };

async function fetchEntitlement(accessToken: string): Promise<Entitlement> {
  const res = await fetch("/api/entitlement", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return FREE;
  return (await res.json()) as Entitlement;
}

/**
 * Server-authoritative entitlement hook.
 * Reads from /api/entitlement which queries the subscriptions table only.
 * Unauthenticated or loading states fail open to free tier.
 */
export function useEntitlement() {
  const { user, session } = useAuth();

  const { data, isLoading } = useQuery<Entitlement>({
    queryKey: ["entitlement", user?.id],
    queryFn:  () => fetchEntitlement(session!.access_token),
    enabled:  !!user && !!session,
    staleTime: 2 * 60 * 1000,     // 2-minute cache — fresh enough for gates
    placeholderData: FREE,
  });

  return {
    tier:             (data ?? FREE).tier,
    maxProfiles:      (data ?? FREE).max_profiles,
    currentPeriodEnd: (data ?? FREE).current_period_end,
    isPremium:        (data ?? FREE).tier !== "free",
    isLoading:        !!user && isLoading,
  };
}

/** Call this after a successful payment to force-refresh the entitlement cache. */
export function useInvalidateEntitlement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () => qc.invalidateQueries({ queryKey: ["entitlement", user?.id] });
}
