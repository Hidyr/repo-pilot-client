import { RunsTable } from "@/components/projects/runs-table"
import { getProjectById, getRunsForProject } from "@/lib/api/server-data"
import { notFound } from "next/navigation"

export default async function ProjectRunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  if (!(await getProjectById(projectId))) notFound()

  const runs = await getRunsForProject(projectId)

  return (
    <>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Newest first. Expand a row for the run log.
      </p>
      <RunsTable runs={runs} />
    </>
  )
}
