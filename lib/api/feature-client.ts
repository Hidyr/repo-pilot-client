"use client"

import { apiBase } from "@/lib/api/env"
import type { FeatureStatus } from "@/lib/dummy-data"

export async function putFeature(
  id: string,
  body: Partial<{ status: FeatureStatus; title: string; description: string }>
) {
  const b = apiBase()
  if (!b) return undefined
  const res = await fetch(`${b}/features/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`putFeature ${id}: ${res.status}`)
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
