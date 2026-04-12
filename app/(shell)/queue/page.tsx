import { Clock } from "lucide-react"

import { ShellPage } from "@/components/app/shell-page"
import { getQueueSnapshot } from "@/lib/api/server-data"
import Link from "next/link"

export default async function QueuePage() {
  const q = await getQueueSnapshot()

  return (
    <ShellPage maxWidth="standard">
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 text-[13px] font-medium">
          Jobs
        </div>
        <ul className="divide-y divide-border">
          {q.jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={
                  job.runId
                    ? `/projects/${encodeURIComponent(job.projectId)}/runs?runId=${encodeURIComponent(job.runId)}`
                    : `/projects/${encodeURIComponent(job.projectId)}/runs`
                }
                className="flex items-center gap-3 px-4 py-3 text-[13px] transition-colors hover:bg-muted/40"
              >
                {job.status === "active" ? (
                  <span className="size-2 shrink-0 rounded-full bg-muted-foreground/80" />
                ) : (
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{job.projectName}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span>{job.featureTitle}</span>
                </span>
                <span className="shrink-0 text-[11px] uppercase text-muted-foreground">
                  {job.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ShellPage>
  )
}
