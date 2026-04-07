import type { QueueJob, QueueSnapshot } from "@/lib/dummy-data"

/** Shape from GET /api/queue `data` (prompt.md §5.6) */
export type QueueApiData = {
  maxSlots: number
  activeSlots: number
  waitingCount: number
  jobs: Array<{
    id: string
    projectId?: string
    projectName: string
    featureId: string
    featureTitle: string
    status: "waiting" | "active"
  }>
}

export function mapQueueApiToSnapshot(d: QueueApiData): QueueSnapshot {
  const jobs: QueueJob[] = d.jobs.map((j) => ({
    id: j.id,
    projectName: j.projectName,
    featureTitle: j.featureTitle,
    state: j.status === "active" ? "active" : "waiting",
    featureId: j.featureId,
  }))
  return {
    maxSlots: d.maxSlots,
    activeCount: d.activeSlots,
    waitingCount: d.waitingCount,
    jobs,
  }
}
