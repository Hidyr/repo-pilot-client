"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowText,
} from "@/components/design-system/settings-group"
import type { Agent, GitRunStartMode, Project } from "@/lib/api/types"
import { apiBase } from "@/lib/api/env"
import { toast } from "sonner"
import Link from "next/link"

type ScheduleDto = {
  agentId?: string | null
  enabled: boolean
  intervalType: "fixed" | "random"
  runsPerDay: number
  featuresPerRun: number
  executionTimes: string[]
  gitAutoPull: boolean
  gitAutoCommit: boolean
  gitAutoPush: boolean
  gitAutoMerge: boolean
  gitRunStartMode: GitRunStartMode
  gitRunBranch: string | null
}

function padTimes(times: string[], n: number): string[] {
  const out = [...times]
  while (out.length < n) out.push("09:00")
  return out.slice(0, n)
}

export function ScheduleConfigPanel({ project }: { project: Project }) {
  const [loaded, setLoaded] = React.useState(false)
  const [agents, setAgents] = React.useState<Agent[]>([])
  const [agentId, setAgentId] = React.useState<string | null>(null)
  const [auto, setAuto] = React.useState(true)
  const [intervalType, setIntervalType] = React.useState<"fixed" | "random">("fixed")
  const [runsPerDay, setRunsPerDay] = React.useState(2)
  const [featuresPerRun, setFeaturesPerRun] = React.useState(1)
  const [executionTimes, setExecutionTimes] = React.useState<string[]>(["09:00", "18:00"])
  const [pull, setPull] = React.useState(true)
  const [commit, setCommit] = React.useState(true)
  const [push, setPush] = React.useState(false)
  const [merge, setMerge] = React.useState(false)
  const [runStartMode, setRunStartMode] = React.useState<GitRunStartMode>("current")
  const [runBranch, setRunBranch] = React.useState("")

  const git = project.isGitRepo
  const canSaveBranchMode = runStartMode !== "branch" || runBranch.trim().length > 0
  const skipAutosaveOnce = React.useRef(true)

  const buildPayload = React.useCallback((): ScheduleDto => {
    const times =
      intervalType === "fixed" ? padTimes(executionTimes, runsPerDay) : []
    return {
      agentId,
      enabled: auto,
      intervalType,
      runsPerDay,
      featuresPerRun,
      executionTimes: times,
      gitAutoPull: pull,
      gitAutoCommit: commit,
      gitAutoPush: push,
      gitAutoMerge: merge,
      gitRunStartMode: runStartMode,
      gitRunBranch: runStartMode === "branch" ? runBranch.trim() || null : null,
    }
  }, [
    agentId,
    auto,
    intervalType,
    runsPerDay,
    featuresPerRun,
    executionTimes,
    pull,
    commit,
    push,
    merge,
    runStartMode,
    runBranch,
  ])

  const saveSchedule = React.useCallback(
    async (payload: ScheduleDto, opts?: { notifyError?: boolean }) => {
      const b = apiBase()
      if (b) {
        const res = await fetch(`${b}/schedules/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          if (opts?.notifyError !== false) {
            let description = res.statusText
            try {
              const errBody = (await res.json()) as { error?: { message?: string } }
              if (errBody?.error?.message) description = errBody.error.message
            } catch {
              /* use statusText */
            }
            toast.error("Could not save schedule", { description })
          }
          return false
        }
        const j = (await res.json().catch(() => null)) as {
          data?: { enabled?: boolean }
          meta?: { warning?: string }
        } | null
        if (j?.data && typeof j.data.enabled === "boolean") {
          setAuto(j.data.enabled)
        }
        if (j?.meta?.warning) {
          toast.message("Schedule saved", { description: j.meta.warning })
        }
      }
      return true
    },
    [project.id]
  )

  React.useEffect(() => {
    skipAutosaveOnce.current = true
    let cancelled = false
    const b = apiBase()
    if (!b) {
      setLoaded(true)
      return
    }
    ;(async () => {
      try {
        // Load tested agents for selection.
        const agentsRes = await fetch(`${b}/agents`)
        if (agentsRes.ok) {
          const aj = (await agentsRes.json()) as { data?: Agent[] }
          const list = Array.isArray(aj.data) ? aj.data : []
          setAgents(list.filter((a) => a.lastTestOk))
        } else {
          setAgents([])
        }

        const res = await fetch(`${b}/schedules/${project.id}`)
        if (!res.ok || cancelled) return
        const j = (await res.json()) as { data?: ScheduleDto }
        const d = j.data
        if (!d || cancelled) return
        setAgentId(d.agentId ? String(d.agentId) : null)
        setAuto(d.enabled ?? false)
        setIntervalType(d.intervalType === "random" ? "random" : "fixed")
        const rpd = Math.min(4, Math.max(1, Number(d.runsPerDay ?? 1)))
        setRunsPerDay(rpd)
        setFeaturesPerRun(Math.min(3, Math.max(1, Number(d.featuresPerRun ?? 1))))
        setExecutionTimes(padTimes(Array.isArray(d.executionTimes) ? d.executionTimes : [], rpd))
        setPull(!!d.gitAutoPull)
        setCommit(!!d.gitAutoCommit)
        setPush(!!d.gitAutoPush)
        setMerge(!!d.gitAutoMerge)
        const m = d.gitRunStartMode
        setRunStartMode(m === "from_base" || m === "branch" ? m : "current")
        setRunBranch(typeof d.gitRunBranch === "string" ? d.gitRunBranch : "")
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [project.id])

  React.useEffect(() => {
    if (!loaded) return
    if (!apiBase()) return
    if (skipAutosaveOnce.current) {
      skipAutosaveOnce.current = false
      return
    }
    if (!canSaveBranchMode) return
    const t = window.setTimeout(() => {
      void saveSchedule(buildPayload(), { notifyError: false })
    }, 450)
    return () => window.clearTimeout(t)
  }, [
    loaded,
    agentId,
    auto,
    intervalType,
    runsPerDay,
    featuresPerRun,
    executionTimes,
    pull,
    commit,
    push,
    merge,
    runStartMode,
    runBranch,
    canSaveBranchMode,
    buildPayload,
    saveSchedule,
  ])

  const setTimeAt = (i: number, v: string) => {
    setExecutionTimes((prev) => {
      const next = padTimes([...prev], runsPerDay)
      next[i] = v
      return next
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-medium text-foreground">
          Automation schedule
        </h2>
      </div>
      <SettingsGroup className="rounded-none border-0">
        <SettingsRow>
          <SettingsRowText
            title="Enable automation"
            description="Run features on the configured schedule"
          />
          <Checkbox
            checked={auto}
            onCheckedChange={(c) => setAuto(c === true)}
          />
        </SettingsRow>
        <SettingsRow className="flex-wrap">
          <SettingsRowText
            title="Agent"
            description="Agent used for automated runs in this project"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={agents.length === 0 ? "none" : agentId ?? "default"}
              onValueChange={(v) => {
                if (v === "none") return
                if (v === "default") setAgentId(null)
                else setAgentId(v)
              }}
              disabled={agents.length === 0}
            >
              <SelectTrigger size="sm" className="w-[240px]">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.length > 0 ? (
                  <SelectItem value="default">Default enabled agent</SelectItem>
                ) : (
                  <SelectItem value="none">No agent set up</SelectItem>
                )}
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {agents.length === 0 ? (
              <Link
                href="/agents"
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-[0.8rem] text-foreground transition-colors hover:bg-muted"
              >
                Set up agent
              </Link>
            ) : null}
          </div>
        </SettingsRow>
      </SettingsGroup>
      <div className="border-t border-border px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Timing
        </p>
      </div>
      <SettingsGroup className="rounded-none border-0">
        <SettingsRow className="flex-wrap">
          <SettingsRowText
            title="Interval type"
            description={
              intervalType === "fixed"
                ? "You set each run’s clock time below; the same times repeat every day."
                : "Clock times are chosen automatically when the schedule is saved and repeat daily until you change timing again."
            }
          />
          <Select
            value={intervalType}
            onValueChange={(v) => {
              if (v === "fixed" || v === "random") setIntervalType(v)
            }}
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed time</SelectItem>
              <SelectItem value="random">Random time</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow className="flex-wrap">
          <SettingsRowText
            title="Runs per day"
            description={
              intervalType === "fixed"
                ? "How many automation passes to run each day (1–4). Each slot has its own time below."
                : "How many automation passes to run each day (1–4). Times are spread randomly through the day."
            }
          />
          <Select
            value={String(runsPerDay)}
            onValueChange={(v) => {
              const n = Number(v)
              if (n >= 1 && n <= 4) {
                setRunsPerDay(n)
                setExecutionTimes((prev) => padTimes(prev, n))
              }
            }}
          >
            <SelectTrigger size="sm" className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Execution times"
            description={
              intervalType === "random"
                ? "Not used for random interval"
                : "One time per run slot (24h)"
            }
          />
          {intervalType === "fixed" ? (
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: runsPerDay }, (_, i) => (
                <Input
                  key={i}
                  type="time"
                  step={60}
                  className="h-8 w-24 font-mono text-xs"
                  value={executionTimes[i] ?? "09:00"}
                  onChange={(e) => setTimeAt(i, e.target.value)}
                  aria-label={`Run time ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">—</p>
          )}
        </SettingsRow>
        <SettingsRow className="flex-wrap">
          <SettingsRowText
            title="Features per run"
            description="How many pending features to work through in each scheduled pass (1–3)."
          />
          <Select
            value={String(featuresPerRun)}
            onValueChange={(v) => {
              const n = Number(v)
              if (n >= 1 && n <= 3) setFeaturesPerRun(n)
            }}
          >
            <SelectTrigger size="sm" className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsGroup>

      {git ? (
        <>
          <div className="border-t border-border px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Git automation
            </p>
          </div>
          <SettingsGroup className="rounded-none border-0">
            <SettingsRow className="flex-wrap">
              <SettingsRowText
                title="Branch before run"
                description={
                  runStartMode === "current"
                    ? "Stay on whatever branch is checked out; optional pull below still applies."
                    : runStartMode === "from_base"
                      ? `Check out ${project.defaultBranch ?? "main"}, pull if enabled, then create or reset a branch named from the feature title (e.g. "dark mode" → dark-mode) for each run. Your previous branch is restored afterward.`
                      : "Check out the branch you name below before the agent runs; restored afterward."
                }
              />
              <div className="flex min-w-0 w-full max-w-md flex-col gap-2 sm:w-auto">
                <Select
                  value={runStartMode}
                  onValueChange={(v) => {
                    if (v === "current" || v === "from_base" || v === "branch") {
                      setRunStartMode(v)
                    }
                  }}
                >
                  <SelectTrigger size="sm" className="w-full sm:w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current branch</SelectItem>
                    <SelectItem value="from_base">New branch from base</SelectItem>
                    <SelectItem value="branch">Fixed branch</SelectItem>
                  </SelectContent>
                </Select>
                {runStartMode === "branch" ? (
                  <Input
                    placeholder="e.g. develop"
                    className="h-8 font-mono text-xs"
                    value={runBranch}
                    onChange={(e) => setRunBranch(e.target.value)}
                    aria-label="Branch to check out"
                  />
                ) : null}
                {runStartMode === "branch" && !runBranch.trim() ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-500">
                    Enter a branch name to save this option.
                  </p>
                ) : null}
              </div>
            </SettingsRow>
            <SettingsRow>
              <SettingsRowText title="Auto pull before run" />
              <Checkbox
                checked={pull}
                onCheckedChange={(c) => setPull(c === true)}
              />
            </SettingsRow>
            <SettingsRow>
              <SettingsRowText title="Auto commit after run" />
              <Checkbox
                checked={commit}
                onCheckedChange={(c) => setCommit(c === true)}
              />
            </SettingsRow>
            <SettingsRow>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Checkbox
                  id="push"
                  checked={push}
                  disabled={!commit}
                  onCheckedChange={(v) => setPush(v === true)}
                />
                <Label
                  htmlFor="push"
                  className={`text-[13px] ${!commit ? "text-muted-foreground" : ""}`}
                >
                  Auto push to remote
                </Label>
              </div>
              {!commit ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="text-[11px] text-muted-foreground underline decoration-dotted" />
                    }
                  >
                    Why disabled?
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Requires Auto Commit to be enabled first.
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </SettingsRow>
            <SettingsRow>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Checkbox
                  id="merge"
                  checked={merge}
                  disabled={!push}
                  onCheckedChange={(v) => setMerge(v === true)}
                />
                <Label
                  htmlFor="merge"
                  className={`text-[13px] ${!push ? "text-muted-foreground" : ""}`}
                >
                  Auto merge to main
                </Label>
              </div>
              {!push ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="text-[11px] text-muted-foreground underline decoration-dotted" />
                    }
                  >
                    Why disabled?
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Requires Auto Push to be enabled first.
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </SettingsRow>
            {merge && push ? (
              <div className="px-4 py-2 text-[11px] text-muted-foreground">
                Will merge to: {project.defaultBranch}
              </div>
            ) : null}
          </SettingsGroup>
        </>
      ) : (
        <div className="border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
          Git is not used for this project — changes are written directly to the
          project folder.
        </div>
      )}
      <div className="border-t border-border p-4">
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            if (!canSaveBranchMode) {
              toast.error("Enter a branch name for fixed-branch mode")
              return
            }
            const ok = await saveSchedule(buildPayload(), { notifyError: true })
            if (ok) toast.success("Schedule saved")
          }}
        >
          Save schedule
        </Button>
      </div>
    </div>
  )
}
