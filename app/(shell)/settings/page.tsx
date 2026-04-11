"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowText,
} from "@/components/design-system/settings-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ShellPage } from "@/components/app/shell-page"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { apiBase } from "@/lib/api/env"
import { useAppQueue } from "@/contexts/queue-refresh-context"
import { pickFolder } from "@/lib/os/pick-folder"
import { openDbFolder } from "@/lib/os/open-db-folder"
import { setNativeMinimizeToTray } from "@/lib/os/minimize-to-tray"
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

async function putSettings(
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number }> {
  const b = apiBase()
  if (!b) return { ok: false, status: 0 }
  const res = await fetch(`${b}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return { ok: res.ok, status: res.status }
}

type SettingsPayload = {
  theme?: string
  autostart?: string
  minimize_to_tray?: string
  max_concurrent_runs?: string
  max_concurrent_runs_editable?: string
  max_concurrent_runs_lock_reason?: string
  git_clone_base_dir?: string
}

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const appQueue = useAppQueue()
  const activeQueueJobs = appQueue?.queue.activeSlots ?? 0

  const themeSegment =
    mounted && resolvedTheme === "light" ? "light" : "dark"

  const [maxRuns, setMaxRuns] = React.useState<string[]>(["4"])
  const [minimizeTray, setMinimizeTray] = React.useState(true)
  const [autostart, setAutostart] = React.useState(false)
  const [maxRunsEditable, setMaxRunsEditable] = React.useState(true)
  const [maxRunsLockReason, setMaxRunsLockReason] = React.useState("")
  const [gitCloneBaseDir, setGitCloneBaseDir] = React.useState("")

  const loadSettings = React.useCallback(() => {
    const b = apiBase()
    if (!b) return
    fetch(`${b}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: SettingsPayload } | null) => {
        const d = j?.data
        if (!d) return
        if (d.max_concurrent_runs) setMaxRuns([d.max_concurrent_runs])
        const tray = d.minimize_to_tray === "true"
        setMinimizeTray(tray)
        void setNativeMinimizeToTray(tray)
        setAutostart(d.autostart === "true")
        setMaxRunsEditable(d.max_concurrent_runs_editable !== "false")
        setMaxRunsLockReason(d.max_concurrent_runs_lock_reason ?? "")
        if (typeof d.git_clone_base_dir === "string") setGitCloneBaseDir(d.git_clone_base_dir)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    loadSettings()
  }, [loadSettings])

  React.useEffect(() => {
    loadSettings()
  }, [activeQueueJobs, loadSettings])

  React.useEffect(() => {
    const onFocus = () => loadSettings()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [loadSettings])

  return (
    <ShellPage maxWidth="standard" className="space-y-8">
      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          General
        </h2>
        <SettingsGroup>
          <SettingsRow>
            <SettingsRowText title="Theme" description="UI appearance" />
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={[themeSegment]}
              onValueChange={(next) => {
                if (next.length > 0) {
                  const v = next[next.length - 1]
                  if (v === "light" || v === "dark") {
                    setTheme(v)
                    void putSettings({ theme: v })
                  }
                }
              }}
            >
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
            </ToggleGroup>
          </SettingsRow>
          <SettingsRow className="items-start">
            <div className="min-w-0 flex-1">
              <Label className="text-[13px] text-foreground">Max concurrent runs</Label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {maxRunsEditable
                  ? "How many features can run at once (1–4)."
                  : maxRunsLockReason ||
                    "You cannot change this while runs are active."}
              </p>
            </div>
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={maxRuns}
              disabled={!maxRunsEditable}
              onValueChange={(next) => {
                if (!maxRunsEditable || next.length === 0) return
                const v = next[next.length - 1]!
                const prev = maxRuns[0] ?? "4"
                setMaxRuns([v])
                void (async () => {
                  const { ok, status } = await putSettings({
                    max_concurrent_runs: Number(v),
                  })
                  if (!ok) {
                    setMaxRuns([prev])
                    if (status === 409) {
                      toast.error("Cannot change max concurrent runs", {
                        description:
                          "Wait until no features are in progress and no queue jobs are active.",
                      })
                    } else {
                      toast.error("Could not update setting")
                    }
                  }
                })()
              }}
              className="shrink-0"
            >
              {(["1", "2", "3", "4"] as const).map((n) => (
                <ToggleGroupItem key={n} value={n}>
                  {n}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingsRow>

          <SettingsRow className="items-start">
            <div className="min-w-0 flex-1">
              <Label className="text-[13px] text-foreground">Default Git clone folder</Label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Used when adding a Git repository without a clone path. Leave blank to use{" "}
                <span className="font-mono">~/projects</span>.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={gitCloneBaseDir}
                onChange={(e) => setGitCloneBaseDir(e.target.value)}
                onBlur={() => {
                  const v = gitCloneBaseDir
                  void (async () => {
                    const { ok } = await putSettings({ git_clone_base_dir: v })
                    if (!ok) toast.error("Could not update default clone folder")
                  })()
                }}
                placeholder="e.g. /Users/you/dev"
                className="h-8 w-[320px] font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void (async () => {
                    const selected = await pickFolder()
                    if (!selected) return
                    setGitCloneBaseDir(selected)
                    const { ok } = await putSettings({ git_clone_base_dir: selected })
                    if (!ok) toast.error("Could not update default clone folder")
                  })()
                }}
              >
                Browse
              </Button>
            </div>
          </SettingsRow>
        </SettingsGroup>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Background &amp; startup
        </h2>
        <SettingsGroup>
          <SettingsRow className="items-start">
            <SettingsRowText
              title="Minimize to tray on close"
              description="Closing the window hides the app to your system tray. Right-click the tray icon to quit."
            />
            <Checkbox
              checked={minimizeTray}
              onCheckedChange={(c) => {
                const v = c === true
                setMinimizeTray(v)
                void putSettings({ minimize_to_tray: v })
                void setNativeMinimizeToTray(v)
              }}
            />
          </SettingsRow>
          <SettingsRow className="items-start">
            <SettingsRowText
              title="Launch RepoPilot on system startup"
              description="App will start silently in the tray on login."
            />
            <Checkbox
              checked={autostart}
              onCheckedChange={(c) => {
                const v = c === true
                setAutostart(v)
                void putSettings({ autostart: v })
              }}
            />
          </SettingsRow>
        </SettingsGroup>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          About
        </h2>
        <SettingsGroup>
          <SettingsRow>
            <SettingsRowText title="Version" description="1.0.0" />
          </SettingsRow>
          <SettingsRow>
            <SettingsRowText
              title="Database"
              description="~/.repopilot/repopilot.db"
            />
          </SettingsRow>
          <SettingsRow>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void openDbFolder()}
            >
              Open DB folder
            </Button>
          </SettingsRow>
          <SettingsRow className="items-start">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button type="button" variant="destructive" size="sm">
                    Reset database
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset database?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all projects, features, runs, and queue jobs. Schedules will be
                    removed, and agents will be reset to “not tested”.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void (async () => {
                        const b = apiBase()
                        if (!b) {
                          toast.error("Backend not configured")
                          return
                        }
                        const res = await fetch(`${b}/settings/reset`, { method: "POST" })
                        if (!res.ok) {
                          const j = (await res.json().catch(() => null)) as
                            | { error?: { message?: string } }
                            | null
                          toast.error("Reset failed", {
                            description: j?.error?.message ?? res.statusText,
                          })
                          return
                        }
                        toast.success("Database reset")
                        window.location.href = "/projects"
                      })()
                    }}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SettingsRow>
        </SettingsGroup>
      </section>
    </ShellPage>
  )
}
