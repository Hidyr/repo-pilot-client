import { apiBase } from "@/lib/api/env"
import { mapQueueApiToSnapshot } from "@/lib/api/queue-mapper"
import {
  DUMMY_PROJECTS,
  DUMMY_QUEUE,
  featuresForProject as dummyFeaturesForProject,
  getProject as dummyGetProject,
  runsForProject as dummyRunsForProject,
  type FeatureCard,
  type FeatureStatus,
  type Project,
  type QueueSnapshot,
  type RunRow,
} from "@/lib/dummy-data"

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
  return DUMMY_PROJECTS
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const b = apiBase()
  if (!b) return dummyGetProject(id)
  try {
    const res = await fetch(`${b}/projects/${id}`, { cache: "no-store" })
    if (res.status === 404) return undefined
    if (!res.ok) return dummyGetProject(id)
    const j = (await res.json()) as { data: Project }
    return j.data
  } catch {
    return dummyGetProject(id)
  }
}

function mapFeatureRow(row: Record<string, unknown>): FeatureCard {
  return {
    id: String(row.id),
    projectId: String(row.projectId),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    status: row.status as FeatureStatus,
  }
}

export async function getFeaturesForProject(projectId: string): Promise<FeatureCard[]> {
  const j = await fetchJson<{ data: Record<string, unknown>[] }>(
    `/features?projectId=${encodeURIComponent(projectId)}`
  )
  if (j?.data) return j.data.map((row) => mapFeatureRow(row))
  return dummyFeaturesForProject(projectId)
}

export async function getRunsForProject(
  projectId: string,
  page = 1,
  limit = 50
): Promise<RunRow[]> {
  const j = await fetchJson<{ data: RunRow[] }>(
    `/runs?projectId=${encodeURIComponent(projectId)}&page=${page}&limit=${limit}`
  )
  if (j?.data) return j.data
  return dummyRunsForProject(projectId)
}

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  const j = await fetchJson<{ data: Parameters<typeof mapQueueApiToSnapshot>[0] }>(
    "/queue"
  )
  if (j?.data) return mapQueueApiToSnapshot(j.data)
  return DUMMY_QUEUE
}
