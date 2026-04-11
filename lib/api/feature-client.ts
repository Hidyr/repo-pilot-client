"use client"

import { apiBase } from "@/lib/api/env"
import { mapFeatureRow } from "@/lib/api/map-feature"
import type { Feature, FeatureStatus } from "@/lib/api/types"

export async function putFeature(
  id: string,
  body: Partial<{
    status: FeatureStatus
    title: string
    description: string | null
    userPrompt: string
    frozen: boolean
  }>
): Promise<Feature | null> {
  const b = apiBase()
  if (!b) return null
  const res = await fetch(`${b}/features/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const j = (await res.json().catch(() => null)) as {
      error?: { code?: string; message?: string }
    } | null
    const err = new Error(j?.error?.message ?? `putFeature ${id}: ${res.status}`) as Error & {
      code?: string
    }
    err.code = j?.error?.code
    throw err
  }
  const j = (await res.json()) as { data?: Record<string, unknown> }
  if (!j.data) return null
  return mapFeatureRow(j.data)
}

export async function deleteFeature(
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const b = apiBase()
  if (!b) {
    return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  }
  try {
    const res = await fetch(`${b}/features/${encodeURIComponent(id)}`, { method: "DELETE" })
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

export async function postFeaturesReorder(projectId: string, orderedIds: string[]) {
  const b = apiBase()
  if (!b) return undefined
  const res = await fetch(`${b}/features/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, orderedIds }),
  })
  if (!res.ok) {
    throw new Error(`reorder: ${res.status}`)
  }
}

export async function postFeature(body: {
  projectId: string
  title: string
  description?: string
  userPrompt?: string
}): Promise<Feature | null> {
  const b = apiBase()
  if (!b) return null
  const res = await fetch(`${b}/features`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const j = (await res.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    throw new Error(j?.error?.message ?? `create feature: ${res.status}`)
  }
  const j = (await res.json()) as { data?: Record<string, unknown> }
  if (!j.data) return null
  return mapFeatureRow(j.data)
}
