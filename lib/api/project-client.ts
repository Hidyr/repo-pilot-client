import { apiBase } from "@/lib/api/env"
import type { Project } from "@/lib/api/types"

export async function fetchProjectGitBranches(projectId: string): Promise<
  | { ok: true; current: string; branches: string[] }
  | { ok: false; message: string }
> {
  const b = apiBase()
  if (!b) {
    return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  }
  try {
    const res = await fetch(
      `${b}/projects/${encodeURIComponent(projectId)}/git/branches`
    )
    const j = (await res.json().catch(() => null)) as
      | { data?: { current?: string; branches?: string[] }; error?: { message?: string } }
      | null
    if (!res.ok) {
      return { ok: false, message: j?.error?.message ?? res.statusText }
    }
    const current = j?.data?.current ?? ""
    const branches = Array.isArray(j?.data?.branches) ? j!.data!.branches! : []
    return { ok: true, current, branches }
  } catch {
    return { ok: false, message: "Network error" }
  }
}

export async function checkoutProjectBranch(
  projectId: string,
  branch: string
): Promise<{ ok: true; project: Project } | { ok: false; message: string }> {
  const b = apiBase()
  if (!b) {
    return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  }
  try {
    const res = await fetch(
      `${b}/projects/${encodeURIComponent(projectId)}/git/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch }),
      }
    )
    const j = (await res.json().catch(() => null)) as
      | { data?: Project; error?: { message?: string } }
      | null
    if (!res.ok) {
      return { ok: false, message: j?.error?.message ?? res.statusText }
    }
    if (!j?.data) {
      return { ok: false, message: "Invalid response" }
    }
    return { ok: true, project: j.data }
  } catch {
    return { ok: false, message: "Network error" }
  }
}

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
