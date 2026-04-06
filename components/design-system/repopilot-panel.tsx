"use client"

import * as React from "react"
import { toast } from "sonner"
import { Clock, X } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
import { cn } from "@/lib/utils"

function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="mb-3 mt-10 first:mt-0">
      <h2 className="text-sm font-medium text-foreground">{children}</h2>
      {hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function QueueJobChip({
  active,
  title,
  onCancel,
}: {
  active: boolean
  title: string
  onCancel?: () => void
}) {
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
        <Clock className="size-3 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
      )}
      <span className="min-w-0 flex-1 truncate text-foreground">{title}</span>
      {!active && onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Cancel job"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}

function FeatureCardMini({
  variant,
}: {
  variant: "default" | "queued" | "in_progress" | "failed"
}) {
  return (
    <div className="relative w-full max-w-[200px] rounded-lg border border-border bg-card p-3 text-xs">
      {variant === "queued" ? (
        <div className="mb-2 flex items-center gap-1.5 text-[10px]">
          <StatusBadge status="queued" className="text-[10px]">
            Waiting in queue
          </StatusBadge>
        </div>
      ) : null}
      {variant === "in_progress" ? (
        <div className="mb-2 flex items-center gap-1.5 text-[10px]">
          <StatusBadge status="in_progress" className="text-[10px]">
            Agent running…
          </StatusBadge>
        </div>
      ) : null}
      {variant === "failed" ? (
        <div className="mb-2 text-[10px] text-destructive">
          Failed — click to retry
        </div>
      ) : null}
      <p className="font-medium text-foreground">Dark mode toggle</p>
      <p className="mt-1 line-clamp-2 text-muted-foreground">
        Add system preference detection…
      </p>
    </div>
  )
}

export function RepopilotPanel() {
  const [maxSlots, setMaxSlots] = React.useState<string[]>(["4"])

  return (
    <div className="max-w-3xl pb-16">
      <h1 className="mb-2 text-xl font-medium text-[#e8e8e8]">
        RepoPilot UI patterns
      </h1>
      <p className="mb-8 max-w-2xl text-[13px] text-muted-foreground">
        Status chips, queue, and logs use the same neutral borders and surfaces as
        the rest of settings. Implement in{" "}
        <code className="text-[11px] text-muted-foreground/90">components/ui/*</code>{" "}
        and app layouts.
      </p>

      <SectionTitle hint="Feature, run, and queue labels">
        Status badges
      </SectionTitle>
      <div className="flex flex-wrap gap-2">
        {(
          [
            "pending",
            "queued",
            "waiting",
            "in_progress",
            "active",
            "running",
            "done",
            "success",
            "failed",
            "skipped",
          ] as const
        ).map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </div>

      <SectionTitle hint="Idle row vs expanded queue + job chips">
        Queue status bar
      </SectionTitle>
      <div className="space-y-3">
        <div className="flex h-8 items-center border-t border-border bg-card px-3 text-xs text-muted-foreground">
          <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40" />
          <span className="ml-2">Queue idle — 0/4 slots</span>
        </div>
        <div className="rounded-t-lg border border-b-0 border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Running (2/4) · Waiting (3)
            </span>
            <Button variant="ghost" size="xs" className="h-6 text-[11px]">
              Collapse ▼
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            <QueueJobChip active title="my-app — Add dark mode" />
            <QueueJobChip active title="blog — Fix nav" />
            <QueueJobChip
              active={false}
              title="shop — Checkout flow"
              onCancel={() => toast.message("Cancel job (demo)")}
            />
          </div>
        </div>
      </div>

      <SectionTitle hint="Segmented control; single selection">
        Max concurrent runs
      </SectionTitle>
      <SettingsGroup className="max-w-md">
        <SettingsRow>
          <SettingsRowText
            title="Max concurrent runs"
            description="1–4 slots (stored in app_settings)"
          />
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={maxSlots}
            onValueChange={(next) => {
              if (next.length > 0) setMaxSlots([next[next.length - 1]!])
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
      </SettingsGroup>

      <SectionTitle hint="Run history table and monospace log panel">
        Data table + run log
      </SectionTitle>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-medium">Status</TableHead>
              <TableHead className="text-xs font-medium">Feature</TableHead>
              <TableHead className="text-xs font-medium">Duration</TableHead>
              <TableHead className="text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-border">
              <TableCell>
                <StatusBadge status="success" />
              </TableCell>
              <TableCell className="text-sm">Checkout flow</TableCell>
              <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                2m 14s
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="xs">
                  Logs
                </Button>
              </TableCell>
            </TableRow>
            <TableRow className="border-border">
              <TableCell>
                <StatusBadge status="failed" />
              </TableCell>
              <TableCell className="text-sm">Charts widget</TableCell>
              <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                45s
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="xs">
                  Logs
                </Button>
              </TableCell>
            </TableRow>
            <TableRow className="border-border">
              <TableCell>
                <StatusBadge status="skipped" />
              </TableCell>
              <TableCell className="text-sm italic text-muted-foreground">
                No features available
              </TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 max-h-[140px] overflow-auto rounded-lg border border-border bg-muted/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        <div>
          <span className="text-foreground/70">[GIT]</span> Pulling latest changes…
        </div>
        <div>
          <span className="text-foreground/70">[GIT]</span> Pull complete.
        </div>
        <div>
          <span className="text-foreground/70">[AGENT]</span> Starting…
        </div>
        <div>
          <span className="text-foreground/70">[ERROR]</span> Command timed out
        </div>
      </div>

      <SectionTitle hint="Kanban-style cards">
        Feature cards (states)
      </SectionTitle>
      <div className="flex flex-wrap gap-3">
        <FeatureCardMini variant="default" />
        <FeatureCardMini variant="queued" />
        <FeatureCardMini variant="in_progress" />
        <FeatureCardMini variant="failed" />
      </div>

      <SectionTitle hint="Disabled control when prerequisites missing">
        Checkboxes + tooltips
      </SectionTitle>
      <SettingsGroup className="max-w-lg">
        <SettingsRow className="items-start py-3">
          <div className="flex items-center gap-2">
            <Checkbox id="git-push" disabled />
            <Label htmlFor="git-push" className="text-[13px] text-muted-foreground">
              Auto Push to remote
            </Label>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground underline decoration-dotted"
                />
              }
            >
              Why disabled?
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              Requires Auto Commit to be enabled first.
            </TooltipContent>
          </Tooltip>
        </SettingsRow>
        <SettingsRow className="items-start py-3">
          <div className="flex items-center gap-2">
            <Checkbox id="git-commit" defaultChecked />
            <Label htmlFor="git-commit" className="text-[13px]">
              Auto Commit after run
            </Label>
          </div>
        </SettingsRow>
      </SettingsGroup>

      <SectionTitle hint="Add project and queue cancel flows">
        Dialogs & confirmations
      </SectionTitle>
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger render={<Button variant="chrome" size="sm" />}>
            Add project (dialog)
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add project</DialogTitle>
              <DialogDescription>
                Local folder or Git clone — tabs in the real modal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button size="sm">Add Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
            Cancel queue job…
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from queue?</AlertDialogTitle>
              <AlertDialogDescription>
                Calls <code className="text-xs">DELETE /api/queue/:jobId</code> in
                the app.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction>Cancel job</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <SectionTitle hint="Queue position after Run Now">
        Toasts (Sonner)
      </SectionTitle>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="chrome"
          size="sm"
          onClick={() =>
            toast.success("Queued", {
              description: "Job enqueued — position #3 in queue",
            })
          }
        >
          Queue toast
        </Button>
        <Button
          variant="chrome"
          size="sm"
          onClick={() => toast.error("Clone failed", { description: "Invalid URL" })}
        >
          Error toast
        </Button>
      </div>

      <SectionTitle>Progress</SectionTitle>
      <div className="max-w-sm space-y-2">
        <Progress value={66}>
          <div className="flex w-full items-center gap-2">
            <ProgressLabel>Indexing</ProgressLabel>
            <ProgressValue />
          </div>
          <ProgressTrack>
            <ProgressIndicator className="bg-primary" />
          </ProgressTrack>
        </Progress>
      </div>

      <SectionTitle>Skeleton loading</SectionTitle>
      <div className="flex max-w-sm flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}
