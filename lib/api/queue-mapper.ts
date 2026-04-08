import type { QueueSnapshot } from "@/lib/api/types"

/** Shape from GET /api/queue `data` (prompt.md §5.6) */
export type QueueApiData = {
  maxSlots: number
  activeSlots: number
  waitingCount: number
  jobs: Array<{
    id: string
    projectId: string
    projectName: string
    featureId: string
    runId: string | null
    featureTitle: string
    status: "waiting" | "active"
    priority: number
    createdAt: string
    startedAt?: string
  }>
}

export function mapQueueApiToSnapshot(d: QueueApiData): QueueSnapshot {
  return {
    maxSlots: d.maxSlots,
    activeSlots: d.activeSlots,
    waitingCount: d.waitingCount,
    jobs: d.jobs.map((j) => ({
      id: j.id,
      projectId: j.projectId,
      projectName: j.projectName,
      featureId: j.featureId,
      runId: j.runId ?? null,
      featureTitle: j.featureTitle,
      status: j.status,
      priority: j.priority,
      createdAt: j.createdAt,
      ...(j.startedAt ? { startedAt: j.startedAt } : {}),
    })),
  }
}
