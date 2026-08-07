/**
 * Throwaway route to verify the API client layer against the real backend.
 * Safe to delete once onboarding actually consumes GET /presets.
 */
import { useQuery } from "@tanstack/react-query";
import { getPresets } from "../api/presets";

export function DebugPresetsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["presets"],
    queryFn: () => getPresets(),
  });

  if (isLoading) return <pre className="p-8">Loading…</pre>;
  if (error) return <pre className="p-8 text-red-600">{String(error)}</pre>;

  return (
    <pre className="p-8 text-sm overflow-auto" dir="ltr">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
