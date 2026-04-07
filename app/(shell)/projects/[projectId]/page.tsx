import { ProjectOverview } from "@/components/projects/project-overview"
import { getProjectById } from "@/lib/api/server-data"
import { notFound } from "next/navigation"

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProjectById(projectId)
  if (!project) notFound()

  return <ProjectOverview project={project} />
}
