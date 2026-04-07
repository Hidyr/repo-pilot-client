"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { apiBase } from "@/lib/api/env"
import { deleteFeature, putFeature } from "@/lib/api/feature-client"
import { useQueueRefresh } from "@/contexts/queue-refresh-context"
import { cn } from "@/lib/utils"
import type { Feature, Run } from "@/lib/api/types"

function LogLine({ line }: { line: string }) {
  const m = line.match(/^(\[[^\]]+\])(.*)$/)
  if (!m) {
    return <div>{line}</div>
  }
  return (
    <div>
      <span className="text-foreground/70">{m[1]}</span>
      {m[2]}
    </div>
  )
}

async function fetchRunsForFeature(projectId: string, featureId: string): Promise<Run[]> {
  const b = apiBase()
  if (!b) return []
  const r = await fetch(
    `${b}/runs?projectId=${encodeURIComponent(projectId)}&featureId=${encodeURIComponent(featureId)}&limit=5`,
    { cache: "no-store" }
  )
  if (!r.ok) return []
  const j = (await r.json()) as { data?: Run[] }
  return j.data ?? []
}

export function FeatureDetailView({
  feature: initialFeature,
  initialRuns,
}: {
  feature: Feature
  initialRuns: Run[]
}) {
  const router = useRouter()
  const refreshQueue = useQueueRefresh()
  const [feature, setFeature] = React.useState(initialFeature)
  const [runs, setRuns] = React.useState<Run[]>(initialRuns)
  const [descriptionDraft, setDescriptionDraft] = React.useState(feature.description ?? "")
  const [userPromptDraft, setUserPromptDraft] = React.useState(feature.userPrompt ?? "")
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const descTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    setFeature(initialFeature)
    setDescriptionDraft(initialFeature.description ?? "")
    setUserPromptDraft(initialFeature.userPrompt ?? "")
  }, [initialFeature])

  React.useEffect(() => {
    setRuns(initialRuns)
  }, [initialRuns])

  const latest = runs[0]
  const logLines =
    (latest?.logs ?? "")
      .split("\n")
      .map((x) => x.trimEnd())
      .filter(Boolean) ?? []
  const showLivePoll =
    feature.status === "in_progress" ||
    feature.status === "queued" ||
    latest?.status === "running"

  React.useEffect(() => {
    if (!apiBase() || !showLivePoll) return
    const tick = () => {
      void fetchRunsForFeature(feature.projectId, feature.id).then(setRuns)
    }
    tick()
    const id = window.setInterval(tick, 2000)
    return () => window.clearInterval(id)
  }, [feature.projectId, feature.id, feature.status, showLivePoll])

  const scheduleSavePrompt = React.useCallback(
    (value: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void putFeature(feature.id, { userPrompt: value }).then((f) => {
          if (f) setFeature(f)
        })
      }, 450)
    },
    [feature.id]
  )

  const scheduleSaveDescription = React.useCallback(
    (value: string) => {
      if (descTimer.current) clearTimeout(descTimer.current)
      descTimer.current = setTimeout(() => {
        const trimmed = value.trim()
        void putFeature(feature.id, { description: trimmed ? trimmed : null }).then((f) => {
          if (f) setFeature(f)
        })
      }, 450)
    },
    [feature.id]
  )

  const boardHref = `/projects/${feature.projectId}/board`

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Link href={boardHref} className="inline-flex">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Board
            </Button>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{feature.title}</h1>
            <StatusBadge status={feature.status} className="text-[10px]" />
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deleting}
                    className="shrink-0 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5"
                    aria-label="Delete feature"
                  />
                }
              >
                <Trash2 className="size-3.5" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this feature?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Removes the feature, its runs, and any queue jobs. An active run will be
                    cancelled. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      void (async () => {
                        setDeleting(true)
                        try {
                          const result = await deleteFeature(feature.id)
                          if (!result.ok) {
                            toast.error("Could not delete feature", { description: result.message })
                            return
                          }
                          toast.success("Feature removed")
                          await refreshQueue?.()
                          router.push(boardHref)
                          router.refresh()
                        } finally {
                          setDeleting(false)
                        }
                      })()
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <Label htmlFor="feature-desc" className="text-[13px] text-foreground">
          Description
        </Label>
        <p className="text-[11px] text-muted-foreground">
          Summary of what this feature is for. Saved automatically when you stop typing.
        </p>
        <Textarea
          id="feature-desc"
          value={descriptionDraft}
          onChange={(e) => {
            const v = e.target.value
            setDescriptionDraft(v)
            scheduleSaveDescription(v)
          }}
          rows={4}
          placeholder="Optional. What should ship in this feature?"
          className="max-w-3xl"
        />
      </section>

      <section className="space-y-2">
        <Label className="text-[13px] text-foreground">Agent instructions</Label>
        <p className="text-[11px] text-muted-foreground">
          Optional context merged into the prompt so the agent stays aligned with how you want this
          feature built (similar to a Cursor chat instruction).
        </p>
        <textarea
          value={userPromptDraft}
          onChange={(e) => {
            const v = e.target.value
            setUserPromptDraft(v)
            scheduleSavePrompt(v)
          }}
          rows={5}
          className={cn(
            "w-full max-w-3xl resize-y rounded-lg border border-border bg-background px-3 py-2",
            "font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          )}
          placeholder="e.g. Prefer CSS variables for theming; keep components under 200 lines; add tests for the toggle hook."
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[13px] text-foreground">Agent output</Label>
          {latest?.status === "running" ? (
            <span className="text-[11px] tabular-nums text-amber-400/90">Streaming…</span>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Stdout-style log for the latest run of this feature (live refresh while running).
        </p>
        <div
          className={cn(
            "h-[min(420px,50vh)] overflow-auto rounded-lg border border-border",
            "bg-[#0d0d0f] p-3 font-mono text-[11px] leading-relaxed text-neutral-300"
          )}
        >
          {logLines.length === 0 ? (
            <p className="text-neutral-500">
              No agent output yet. Start a run from the board; logs appear here when the job is
              active.
            </p>
          ) : (
            logLines.map((line, i) => <LogLine key={i} line={line} />)
          )}
        </div>
      </section>
    </div>
  )
}
