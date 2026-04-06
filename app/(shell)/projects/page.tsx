import { FolderOpen } from "lucide-react"

import { AddProjectDialog } from "@/components/projects/add-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import { DUMMY_PROJECTS } from "@/lib/dummy-data"

export default function ProjectsPage() {
  const hasProjects = DUMMY_PROJECTS.length > 0

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-[13px] text-muted-foreground">
          Local-first projects and feature automation (demo data).
        </p>
        <AddProjectDialog />
      </div>

      {hasProjects ? (
        <ul className="flex flex-col gap-3">
          {DUMMY_PROJECTS.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderOpen className="mb-3 size-10 text-muted-foreground" strokeWidth={1.25} />
          <p className="text-[15px] font-medium text-foreground">Add your first repository</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            Connect a local folder or clone a Git repo to start scheduling features.
          </p>
          <div className="mt-6">
            <AddProjectDialog />
          </div>
        </div>
      )}
    </div>
  )
}
