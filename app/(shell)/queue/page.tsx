import { Clock } from "lucide-react"

import { ShellPage } from "@/components/app/shell-page"
import { getQueueSnapshot } from "@/lib/api/server-data"

export default async function QueuePage() {
  const q = await getQueueSnapshot()

  return (
    <ShellPage maxWidth="standard">
      <p className="mb-6 text-[13px] text-muted-foreground">
        Live queue mirrors the bar at the bottom. The app shell uses a WebSocket to{" "}
        <code className="font-mono text-[11px] text-muted-foreground">/api/queue/ws</code>
        ; <code className="font-mono text-[11px] text-muted-foreground">GET /api/queue</code> is
        for snapshots and manual refresh.
      </p>
      <div className="rounded-lg border border-border border-red-400 text-red-400 bg-card">
        <div className="px-4 py-3 text-[13px] font-medium">
          Jobs
        </div>
        <ul className="divide-y divide-border">
          {q.jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center gap-3 px-4 py-3 text-[13px]"
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
            </li>
          ))}
        </ul>
      </div>
    </ShellPage>
  )
}
