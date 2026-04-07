"use client"

import { KanbanBoard } from "@/components/projects/kanban-board"
import { useBoardStream } from "@/hooks/use-board-stream"
import type { FeatureCard } from "@/lib/dummy-data"

export function BoardLive({
  projectId,
  initialFeatures,
}: {
  projectId: string
  initialFeatures: FeatureCard[]
}) {
  const { features } = useBoardStream(projectId, initialFeatures)
  return <KanbanBoard features={features} projectId={projectId} />
}

