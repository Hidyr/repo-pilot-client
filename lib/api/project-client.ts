import { apiBase } from "@/lib/api/env"

export async function deleteProject(
  projectId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const b = apiBase()
  if (!b) {
    return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  }
  try {
    const res = await fetch(`${b}/projects/${encodeURIComponent(projectId)}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null
      return { ok: false, message: j?.error?.message ?? res.statusText }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: "Network error" }
  }
}
