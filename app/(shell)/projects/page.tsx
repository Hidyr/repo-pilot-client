import { ShellPage } from "@/components/app/shell-page"
import { ProjectsBrowser } from "@/components/projects/projects-browser"
import { DUMMY_PROJECTS } from "@/lib/dummy-data"

export default function ProjectsPage() {
  return (
    <ShellPage maxWidth="wide">
      <ProjectsBrowser projects={DUMMY_PROJECTS} />
    </ShellPage>
  )
}
