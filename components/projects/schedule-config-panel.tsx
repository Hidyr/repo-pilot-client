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
import type { Project } from "@/lib/dummy-data"
import { toast } from "sonner"

export function ScheduleConfigPanel({ project }: { project: Project }) {
  const [auto, setAuto] = React.useState(true)
  const [pull, setPull] = React.useState(true)
  const [commit, setCommit] = React.useState(true)
  const [push, setPush] = React.useState(false)
  const [merge, setMerge] = React.useState(false)

  const git = project.isGitRepo

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
      </SettingsGroup>
      <div className="border-t border-border px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Timing
        </p>
      </div>
      <SettingsGroup className="rounded-none border-0">
        <SettingsRow className="flex-wrap">
          <SettingsRowText title="Interval type" />
          <Select defaultValue="fixed">
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
          <SettingsRowText title="Runs per day" />
          <Select defaultValue="2">
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
            description="Demo — add times in the real app"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Input className="h-8 w-24 font-mono text-xs" defaultValue="09:00" readOnly />
            <Input className="h-8 w-24 font-mono text-xs" defaultValue="18:00" readOnly />
            <Button type="button" variant="outline" size="xs" disabled>
              + Add time
            </Button>
          </div>
        </SettingsRow>
        <SettingsRow className="flex-wrap">
          <SettingsRowText title="Features per run" />
          <Select defaultValue="1">
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
          onClick={() => toast.success("Schedule saved (demo)")}
        >
          Save schedule
        </Button>
      </div>
    </div>
  )
}
