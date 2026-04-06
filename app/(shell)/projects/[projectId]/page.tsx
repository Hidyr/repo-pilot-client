import { ProjectOverview } from "@/components/projects/project-overview"
import { getProject } from "@/lib/dummy-data"
import { notFound } from "next/navigation"

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = getProject(projectId)
  if (!project) notFound()

  return <ProjectOverview project={project} />
}
