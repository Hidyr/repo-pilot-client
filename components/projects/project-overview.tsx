"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Project } from "@/lib/api/types"
import { apiBase } from "@/lib/api/env"
import { toast } from "sonner"
import {
  checkoutProjectBranch,
  deleteProject,
  fetchProjectGitBranches,
} from "@/lib/api/project-client"
import { ProjectReadmeView } from "@/components/projects/project-readme-view"
import { useQueueRefresh } from "@/contexts/queue-refresh-context"

export function ProjectOverview({ project }: { project: Project }) {
  const router = useRouter()
  const refreshQueue = useQueueRefresh()
  const [name, setName] = React.useState(project.name)
  const [description, setDescription] = React.useState(project.description ?? "")
  const [deleting, setDeleting] = React.useState(false)

  const [gitBranches, setGitBranches] = React.useState<string[]>([])
  const [gitCurrent, setGitCurrent] = React.useState(project.defaultBranch ?? "")
  const [gitBranchesLoading, setGitBranchesLoading] = React.useState(false)
  const [gitBranchesErr, setGitBranchesErr] = React.useState<string | null>(null)
  const [gitCheckoutBusy, setGitCheckoutBusy] = React.useState(false)

  React.useEffect(() => {
    setGitCurrent(project.defaultBranch ?? "")
  }, [project.defaultBranch])

  React.useEffect(() => {
    if (!project.isGitRepo) return
    let cancelled = false
    setGitBranchesLoading(true)
    setGitBranchesErr(null)
    void (async () => {
      const r = await fetchProjectGitBranches(project.id)
      if (cancelled) return
      setGitBranchesLoading(false)
      if (!r.ok) {
        setGitBranchesErr(r.message)
        return
      }
      setGitBranches(r.branches)
      setGitCurrent(r.current || project.defaultBranch || "")
    })()
    return () => {
      cancelled = true
    }
  }, [project.id, project.isGitRepo, project.defaultBranch])

  const onBranchChange = React.useCallback(
    async (next: string | null) => {
      if (next == null || next === gitCurrent) return
      setGitCheckoutBusy(true)
      const r = await checkoutProjectBranch(project.id, next)
      setGitCheckoutBusy(false)
      if (!r.ok) {
        toast.error("Could not check out branch", { description: r.message })
        return
      }
      setGitCurrent(
        r.project.defaultBranch ?? next
      )
      toast.success(`Checked out ${next}`)
      router.refresh()
      const br = await fetchProjectGitBranches(project.id)
      if (br.ok) {
        setGitBranches(br.branches)
        setGitCurrent(br.current || next)
      }
    },
    [gitCurrent, project.id, router]
  )

  const save = React.useCallback(
    async (patch: { name?: string; description?: string }) => {
      const b = apiBase()
      if (!b) return
      const r = await fetch(`${b}/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!r.ok) {
        toast.error("Could not save project", { description: r.statusText })
      }
    },
    [project.id]
  )

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-name">Name</Label>
          <Input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => void save({ name })}
            className="max-w-md"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-desc">Description</Label>
          <Input
            id="p-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => void save({ description })}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-medium text-foreground">Git</h2>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-[13px]">
          <p>
            <span className="text-muted-foreground">Local path: </span>
            <span className="font-mono text-xs text-foreground">{project.localPath}</span>
          </p>
          {project.isGitRepo ? (
            <>
              <p className="mt-2">
                <span className="text-muted-foreground">Remote: </span>
                {project.remoteUrl}
              </p>
              <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="text-muted-foreground">Branch</span>
                {gitBranchesLoading ? (
                  <span className="text-[12px] text-muted-foreground">
                    Loading branches…
                  </span>
                ) : gitBranchesErr ? (
                  <span className="font-mono text-xs text-foreground">
                    {project.defaultBranch ?? "—"}
                    <span className="ml-2 text-muted-foreground">
                      ({gitBranchesErr})
                    </span>
                  </span>
                ) : gitBranches.length === 0 ? (
                  <span className="font-mono text-xs text-foreground">
                    {gitCurrent || project.defaultBranch || "—"}
                  </span>
                ) : (
                  <Select
                    value={gitCurrent}
                    onValueChange={(v) => void onBranchChange(v)}
                    disabled={gitCheckoutBusy}
                  >
                    <SelectTrigger size="sm" className="w-full min-w-[200px] max-w-sm sm:w-[min(100%,280px)]">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {gitBranches.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground">
              This folder is not a Git repository. RepoPilot will not run Git
              commands for this project.
            </p>
          )}
        </div>
      </section>

      <ProjectReadmeView projectId={project.id} />

      <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="mb-1 text-[13px] font-medium text-destructive">Remove project</h2>
        <p className="mb-3 text-[12px] text-muted-foreground">
          Removes this project from RepoPilot. Your files on disk are not deleted.
        </p>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" disabled={deleting} />}>
            Delete project…
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{project.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Features, runs, and queue jobs for this project will be
                removed from RepoPilot. The folder at{" "}
                <span className="font-mono text-xs">{project.localPath}</span> stays on your
                machine.
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
                      const result = await deleteProject(project.id)
                      if (!result.ok) {
                        toast.error("Could not delete project", { description: result.message })
                        return
                      }
                      toast.success("Project removed")
                      await refreshQueue?.()
                      router.push("/projects")
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
      </section>
    </div>
  )
}
