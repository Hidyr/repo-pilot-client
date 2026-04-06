import { notFound } from "next/navigation"

import { ShellPage } from "@/components/app/shell-page"
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
    <div className="flex flex-col">
      <ProjectSubnav projectId={projectId} />
      <ShellPage maxWidth="wide">{children}</ShellPage>
    </div>
  )
}
