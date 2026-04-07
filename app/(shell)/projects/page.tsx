import { ShellPage } from "@/components/app/shell-page"
import { ProjectsBrowser } from "@/components/projects/projects-browser"
import { getProjectsList } from "@/lib/api/server-data"

export default async function ProjectsPage() {
  const projects = await getProjectsList()
  return (
    <ShellPage maxWidth="wide">
      <ProjectsBrowser projects={projects} />
    </ShellPage>
  )
}
