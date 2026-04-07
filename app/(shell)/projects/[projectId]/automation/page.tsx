import { ScheduleConfigPanel } from "@/components/projects/schedule-config-panel"
import { getProjectById } from "@/lib/api/server-data"
import { notFound } from "next/navigation"

export default async function ProjectAutomationPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProjectById(projectId)
  if (!project) notFound()

  return (
    <>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Timing, automation toggle, and Git actions for scheduled runs (demo UI).
      </p>
      <ScheduleConfigPanel project={project} />
    </>
  )
}
