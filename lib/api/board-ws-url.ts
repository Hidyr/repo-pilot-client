import { apiBase } from "@/lib/api/env"

/** WebSocket URL for live board updates for a project. */
export function boardWebSocketUrl(projectId: string): string | null {
  const b = apiBase()
  if (!b) return null
  try {
    const u = new URL(`${b}/projects/${encodeURIComponent(projectId)}/board/ws`)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    return u.toString()
  } catch {
    return null
  }
}

