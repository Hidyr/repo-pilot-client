"use client"

import { KanbanBoard } from "@/components/projects/kanban-board"
import { useBoardStream } from "@/hooks/use-board-stream"
import type { Feature } from "@/lib/api/types"

export function BoardLive({
  projectId,
  initialFeatures,
}: {
  projectId: string
  initialFeatures: Feature[]
}) {
  const { features } = useBoardStream(projectId, initialFeatures)
  return <KanbanBoard features={features} projectId={projectId} />
}

