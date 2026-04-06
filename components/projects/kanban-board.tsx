"use client"

import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
import type { FeatureCard as Feature } from "@/lib/dummy-data"

function FeatureColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[280px] min-w-0 flex-1 flex-col rounded-lg border border-border bg-muted/20">
      <div className="border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-col gap-2 p-2">{children}</div>
    </div>
  )
}

function KanbanCard({ feature }: { feature: Feature }) {
  const queued = feature.status === "queued"
  const running = feature.status === "in_progress"
  const failed = feature.status === "failed"

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-xs shadow-sm",
        failed && "border-destructive/40"
      )}
    >
      {queued ? (
        <div className="mb-2 flex items-center gap-1.5">
          <Clock className="size-3 text-muted-foreground" />
          <StatusBadge status="queued" className="text-[10px]">
            Waiting in queue
          </StatusBadge>
        </div>
      ) : null}
      {running ? (
        <div className="mb-2 flex items-center gap-1.5">
          <StatusBadge status="in_progress" className="text-[10px]">
            Agent running…
          </StatusBadge>
        </div>
      ) : null}
      {failed ? (
        <div className="mb-2 text-[10px] text-destructive">
          Failed — click to retry
        </div>
      ) : null}
      <p className="font-medium text-foreground">{feature.title}</p>
      <p className="mt-1 line-clamp-2 text-muted-foreground">{feature.description}</p>
    </div>
  )
}

export function KanbanBoard({ features }: { features: Feature[] }) {
  const colPending = features.filter((f) =>
    ["pending", "queued", "failed"].includes(f.status)
  )
  const colActive = features.filter((f) => f.status === "in_progress")
  const colDone = features.filter((f) => f.status === "done")

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <FeatureColumn title="Pending">
        {colPending.map((f) => (
          <KanbanCard key={f.id} feature={f} />
        ))}
      </FeatureColumn>
      <FeatureColumn title="In progress">
        {colActive.map((f) => (
          <KanbanCard key={f.id} feature={f} />
        ))}
      </FeatureColumn>
      <FeatureColumn title="Done">
        {colDone.map((f) => (
          <KanbanCard key={f.id} feature={f} />
        ))}
      </FeatureColumn>
    </div>
  )
}
