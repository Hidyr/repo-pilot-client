import { ProjectsBrowser } from "@/components/projects/projects-browser"
import { DUMMY_PROJECTS } from "@/lib/dummy-data"

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ProjectsBrowser projects={DUMMY_PROJECTS} />
    </div>
  )
}
