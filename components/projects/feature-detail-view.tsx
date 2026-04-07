"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { apiBase } from "@/lib/api/env"
import { putFeature } from "@/lib/api/feature-client"
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
  const [feature, setFeature] = React.useState(initialFeature)
  const [runs, setRuns] = React.useState<Run[]>(initialRuns)
  const [userPromptDraft, setUserPromptDraft] = React.useState(feature.userPrompt ?? "")
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setFeature(initialFeature)
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
          </div>
          <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            {feature.description || "No description."}
          </p>
        </div>
      </div>

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
