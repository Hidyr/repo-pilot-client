"use client"

import { apiBase } from "@/lib/api/env"
import type { FeatureCard, FeatureStatus } from "@/lib/dummy-data"

function mapFeatureRow(row: Record<string, unknown>): FeatureCard {
  return {
    id: String(row.id),
    projectId: String(row.projectId ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    status: row.status as FeatureStatus,
    ...(typeof row.userPrompt === "string" ? { userPrompt: row.userPrompt } : {}),
  }
}

export async function putFeature(
  id: string,
  body: Partial<{
    status: FeatureStatus
    title: string
    description: string
    userPrompt: string
  }>
): Promise<FeatureCard | null> {
  const b = apiBase()
  if (!b) return null
  const res = await fetch(`${b}/features/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`putFeature ${id}: ${res.status}`)
  }
  const j = (await res.json()) as { data?: Record<string, unknown> }
  if (!j.data) return null
  return mapFeatureRow(j.data)
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
