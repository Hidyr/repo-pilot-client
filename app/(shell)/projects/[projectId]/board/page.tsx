import { BoardLive } from "@/components/projects/board-live"
import { getFeaturesForProject, getProjectById } from "@/lib/api/server-data"
import { notFound } from "next/navigation"

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  if (!(await getProjectById(projectId))) notFound()

  const features = await getFeaturesForProject(projectId)

  return (
    <>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Drag cards between columns. Waiting (`queued`) and running (`in_progress`) cards are locked and synced live across windows.
      </p>
      {features.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No features yet. Add one in the Pending column to get started.
        </p>
      ) : (
        <BoardLive projectId={projectId} initialFeatures={features} />
      )}
    </>
  )
}
