import { Clock } from "lucide-react"

import { DUMMY_QUEUE } from "@/lib/dummy-data"

export default function QueuePage() {
  const q = DUMMY_QUEUE

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-6 text-[13px] text-muted-foreground">
        Live queue mirrors the bar at the bottom (static demo). In production this
        polls <code className="font-mono text-[11px] text-muted-foreground">GET /api/queue</code>.
      </p>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-[13px] font-medium">
          Jobs
        </div>
        <ul className="divide-y divide-border">
          {q.jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center gap-3 px-4 py-3 text-[13px]"
            >
              {job.state === "active" ? (
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
                {job.state}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
