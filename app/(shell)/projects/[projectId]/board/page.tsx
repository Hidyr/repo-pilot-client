import { KanbanBoard } from "@/components/projects/kanban-board"
import { featuresForProject, getProject } from "@/lib/dummy-data"
import { notFound } from "next/navigation"

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  if (!getProject(projectId)) notFound()

  const features = featuresForProject(projectId)

  return (
    <>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Drag cards between columns (queued and running items stay fixed). Changes are local to this session.
      </p>
      {features.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No features for this project in the demo dataset. Try project{" "}
          <span className="font-mono text-foreground">my-app</span> (proj-1).
        </p>
      ) : (
        <KanbanBoard features={features} />
      )}
    </>
  )
}
