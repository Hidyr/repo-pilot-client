"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Clock, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { apiBase } from "@/lib/api/env"
import type { QueueJob, QueueSnapshot } from "@/lib/dummy-data"

function JobChip({
  job,
  onCancel,
}: {
  job: QueueJob
  onCancel?: (id: string) => void | Promise<void>
}) {
  const label = `${job.projectName} — ${job.featureTitle}`
  const active = job.state === "active"

  return (
    <div
      className={cn(
        "flex max-w-[220px] items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs",
        active && "bg-muted/25"
      )}
    >
      {active ? (
        <span
          className="size-2 shrink-0 rounded-full bg-muted-foreground/80"
          aria-hidden
        />
      ) : (
        <Clock className="size-3 shrink-0 text-muted-foreground" strokeWidth={2} />
      )}
      <span
        className="min-w-0 flex-1 cursor-default truncate text-foreground"
        title={label}
      >
        {label}
      </span>
      {!active && onCancel ? (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Cancel job"
              />
            }
          >
            <X className="size-3.5" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from queue?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove this waiting job from the queue. Job id: {job.id}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void (async () => {
                    if (onCancel) await onCancel(job.id)
                  })()
                }}
              >
                Cancel job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  )
}

export function QueueStatusBar({
  queue,
  onRefresh,
}: {
  queue: QueueSnapshot
  onRefresh?: () => Promise<void>
}) {
  const router = useRouter()
  const q = queue
  const [expanded, setExpanded] = React.useState(true)
  const hasJobs = q.jobs.length > 0

  const cancelWaitingJob = React.useCallback(
    async (jobId: string) => {
      const b = apiBase()
      if (!b) {
        toast.message("Queue API not configured")
        return
      }
      const r = await fetch(`${b}/queue/${jobId}`, { method: "DELETE" })
      if (!r.ok) {
        toast.error("Could not cancel job", {
          description: r.status === 409 ? "Job is already active" : r.statusText,
        })
        return
      }
      await onRefresh?.()
      router.refresh()
      toast.message("Job removed from queue")
    },
    [onRefresh, router]
  )

  const idle =
    !hasJobs || (q.activeCount === 0 && q.waitingCount === 0)

  if (idle) {
    return (
      <div className="flex h-8 shrink-0 items-center border-t border-border bg-card px-3 text-xs text-muted-foreground">
        <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40" />
        <span className="ml-2">
          Queue idle — 0/{q.maxSlots} slots
        </span>
      </div>
    )
  }

  return (
    <div className="shrink-0 border-t border-border bg-card">
      {expanded ? (
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Running ({q.activeCount}/{q.maxSlots}) · Waiting ({q.waitingCount})
            </span>
            <Button
              variant="ghost"
              size="xs"
              className="h-6 text-[11px]"
              onClick={() => setExpanded(false)}
            >
              Collapse
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            {q.jobs.map((job) => (
              <JobChip
                key={job.id}
                job={job}
                onCancel={
                  job.state === "waiting" ? () => cancelWaitingJob(job.id) : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-8 items-center justify-between px-3 text-xs text-muted-foreground">
          <span>
            Running ({q.activeCount}/{q.maxSlots}) · Waiting ({q.waitingCount})
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 text-[11px]"
            onClick={() => setExpanded(true)}
          >
            Expand
          </Button>
        </div>
      )}
    </div>
  )
}
