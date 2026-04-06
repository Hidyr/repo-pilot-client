"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/dummy-data"

function formatRelative(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ProjectCard({
  project,
  layout = "list",
}: {
  project: Project
  layout?: "list" | "grid"
}) {
  const actions = (
    <>
      <Button
        size="sm"
        variant="chrome"
        className={cn(layout === "grid" && "flex-1")}
        render={<Link href={`/projects/${project.id}`} />}
      >
        Open
      </Button>
      <Button
        size="sm"
        variant="outline"
        className={cn(layout === "grid" && "flex-1")}
        onClick={() =>
          toast.success("Queued", {
            description: "Job enqueued — position #3 in queue (demo)",
          })
        }
      >
        Run now
      </Button>
    </>
  )

  return (
    <Card className="h-full border-border bg-card transition-colors hover:bg-muted/20">
      <CardContent className={cn("p-4", layout === "grid" && "flex h-full flex-col")}>
        {layout === "list" ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="truncate text-[15px] font-medium text-foreground hover:underline"
                >
                  {project.name}
                </Link>
                {project.hasActiveRun ? (
                  <span
                    className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                    title="Active run"
                    aria-hidden
                  />
                ) : null}
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {project.localPath}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  Remote:{" "}
                  {project.isGitRepo && project.remoteUrl ? (
                    <span className="text-foreground/80">{project.remoteUrl}</span>
                  ) : (
                    "—"
                  )}
                </span>
                <span>
                  Branch:{" "}
                  {project.isGitRepo && project.branch ? (
                    <span className="text-foreground/80">{project.branch}</span>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              {!project.isGitRepo ? (
                <p className="mt-2 text-[11px] text-muted-foreground">No Git</p>
              ) : null}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Pending {project.pendingCount} · Done {project.doneCount} · Last run{" "}
                {formatRelative(project.lastRunAt)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">{actions}</div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="truncate text-[14px] font-medium text-foreground hover:underline"
                  >
                    {project.name}
                  </Link>
                  {project.hasActiveRun ? (
                    <span
                      className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                      title="Active run"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
            <p
              className="mt-2 truncate font-mono text-[10px] text-muted-foreground"
              title={project.localPath}
            >
              {project.localPath}
            </p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {!project.isGitRepo
                ? "Local only"
                : `${project.branch ?? "—"} · Pending ${project.pendingCount}`}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Last run {formatRelative(project.lastRunAt)}
            </p>
            <div className="mt-auto flex gap-2 pt-4">{actions}</div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
