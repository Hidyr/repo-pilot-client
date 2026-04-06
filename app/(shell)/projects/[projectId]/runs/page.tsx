import { RunsTable } from "@/components/projects/runs-table"
import { getProject, runsForProject } from "@/lib/dummy-data"
import { notFound } from "next/navigation"

export default async function ProjectRunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  if (!getProject(projectId)) notFound()

  const runs = runsForProject(projectId)

  return (
    <>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Newest first. Expand a row for the run log (demo data).
      </p>
      <RunsTable runs={runs} />
    </>
  )
}
