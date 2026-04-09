import { apiBase } from "@/lib/api/env"

/** WebSocket URL for live run log lines (same host as `NEXT_PUBLIC_API_BASE`). */
export function runLogWebSocketUrl(runId: string): string | null {
  const b = apiBase()
  if (!b) return null
  try {
    const u = new URL(`${b}/runs/${encodeURIComponent(runId)}/logs/ws`)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    return u.toString()
  } catch {
    return null
  }
}
