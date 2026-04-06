import { notFound } from "next/navigation"

import { ProjectSubnav } from "@/components/projects/project-subnav"
import { getProject } from "@/lib/dummy-data"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  if (!getProject(projectId)) {
    notFound()
  }

  return (
    <div>
      <ProjectSubnav projectId={projectId} />
      {children}
    </div>
  )
}
