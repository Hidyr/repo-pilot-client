"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { RunRow } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"

function formatDuration(sec: number) {
  if (sec <= 0) return "—"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatStarted(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString()
}

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

function LogViewer({ lines }: { lines: string[] }) {
  return (
    <div
      className={cn(
        "max-h-[400px] overflow-auto rounded-md border border-border bg-muted/20 p-3",
        "font-mono text-[11px] leading-relaxed text-muted-foreground"
      )}
    >
      {lines.map((line, i) => (
        <LogLine key={i} line={line} />
      ))}
    </div>
  )
}

export function RunsTable({ runs }: { runs: RunRow[] }) {
  const [openId, setOpenId] = React.useState<string | null>(runs[0]?.id ?? null)

  if (runs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No runs yet for this project.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead className="text-xs font-medium">Status</TableHead>
            <TableHead className="text-xs font-medium">Feature</TableHead>
            <TableHead className="text-xs font-medium">Started</TableHead>
            <TableHead className="text-xs font-medium">Duration</TableHead>
            <TableHead className="text-xs font-medium">Commit</TableHead>
            <TableHead className="text-xs font-medium">Pushed</TableHead>
            <TableHead className="text-xs font-medium">Merged</TableHead>
            <TableHead className="text-xs font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const expanded = openId === run.id
            const status =
              run.status === "success"
                ? "success"
                : run.status === "failed"
                  ? "failed"
                  : run.status === "running"
                    ? "running"
                    : "skipped"
            return (
              <React.Fragment key={run.id}>
                <TableRow className="border-border">
                  <TableCell className="py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenId(expanded ? null : run.id)
                      }
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-expanded={expanded}
                    >
                      {expanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate py-2 text-sm">
                    {run.status === "skipped" ? (
                      <span className="italic text-muted-foreground">
                        {run.featureTitle}
                      </span>
                    ) : (
                      run.featureTitle
                    )}
                  </TableCell>
                  <TableCell
                    className="py-2 text-xs text-muted-foreground"
                    title={formatStarted(run.startedAt)}
                  >
                    {formatStarted(run.startedAt)}
                  </TableCell>
                  <TableCell className="py-2 font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDuration(run.durationSec)}
                  </TableCell>
                  <TableCell className="py-2 font-mono text-xs">
                    {run.commit ? (
                      <a
                        href="#"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        {run.commit.slice(0, 7)}
                        <ExternalLink className="size-3 opacity-60" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-xs">
                    {run.pushed ? "✓" : "—"}
                  </TableCell>
                  <TableCell className="py-2 text-xs">
                    {run.merged ? "✓" : "—"}
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        setOpenId(expanded ? null : run.id)
                      }
                    >
                      Logs
                    </Button>
                  </TableCell>
                </TableRow>
                {expanded ? (
                  <TableRow className="border-border bg-muted/10 hover:bg-muted/10">
                    <TableCell colSpan={9} className="p-3">
                      <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                        Run log
                      </p>
                      <LogViewer lines={run.logLines} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
