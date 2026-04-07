import { apiBase } from "@/lib/api/env"
import { mapQueueApiToSnapshot } from "@/lib/api/queue-mapper"
import type { Feature, FeatureStatus, Project, QueueSnapshot, Run } from "@/lib/api/types"

async function fetchJson<T>(path: string): Promise<T | null> {
  const b = apiBase()
  if (!b) return null
  try {
    const res = await fetch(`${b}${path}`, { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getProjectsList(): Promise<Project[]> {
  const j = await fetchJson<{ data: Project[] }>("/projects")
  if (j?.data) return j.data
  return []
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const b = apiBase()
  if (!b) return undefined
  try {
    const res = await fetch(`${b}/projects/${id}`, { cache: "no-store" })
    if (res.status === 404) return undefined
    if (!res.ok) return undefined
    const j = (await res.json()) as { data: Project }
    return j.data
  } catch {
    return undefined
  }
}

function mapFeatureRow(row: Record<string, unknown>): Feature {
  return {
    id: String(row.id ?? ""),
    projectId: String(row.projectId ?? ""),
    title: String(row.title ?? ""),
    description: (row.description as string | null) ?? null,
    userPrompt: (row.userPrompt as string | null) ?? null,
    status: (row.status as FeatureStatus) ?? "pending",
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  }
}

export async function getFeaturesForProject(projectId: string): Promise<Feature[]> {
  const j = await fetchJson<{ data: Record<string, unknown>[] }>(
    `/features?projectId=${encodeURIComponent(projectId)}`
  )
  if (j?.data) return j.data.map((row) => mapFeatureRow(row))
  return []
}

export async function getFeatureForProject(
  projectId: string,
  featureId: string
): Promise<Feature | undefined> {
  const j = await fetchJson<{ data: Record<string, unknown> }>(
    `/features/${encodeURIComponent(featureId)}`
  )
  if (j?.data) {
    const f = mapFeatureRow(j.data)
    if (f.projectId !== projectId) return undefined
    return f
  }
  return undefined
}

export async function getRunsForProject(
  projectId: string,
  page = 1,
  limit = 50
): Promise<Run[]> {
  const j = await fetchJson<{ data: Run[] }>(
    `/runs?projectId=${encodeURIComponent(projectId)}&page=${page}&limit=${limit}`
  )
  if (j?.data) return j.data
  return []
}

export async function getRunsForFeature(
  projectId: string,
  featureId: string,
  limit = 5
): Promise<Run[]> {
  const j = await fetchJson<{ data: Run[] }>(
    `/runs?projectId=${encodeURIComponent(projectId)}&featureId=${encodeURIComponent(featureId)}&page=1&limit=${limit}`
  )
  if (j?.data) return j.data
  return []
}

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  const j = await fetchJson<{ data: Parameters<typeof mapQueueApiToSnapshot>[0] }>(
    "/queue"
  )
  if (j?.data) return mapQueueApiToSnapshot(j.data)
  return { maxSlots: 4, activeSlots: 0, waitingCount: 0, jobs: [] }
}
