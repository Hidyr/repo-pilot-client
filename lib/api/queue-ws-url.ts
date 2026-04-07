import { apiBase } from "@/lib/api/env"

/** WebSocket URL for live queue updates (same host as `NEXT_PUBLIC_API_BASE`). */
export function queueWebSocketUrl(): string | null {
  const b = apiBase()
  if (!b) return null
  try {
    const u = new URL(`${b}/queue/ws`)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    return u.toString()
  } catch {
    return null
  }
}
