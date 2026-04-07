"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Project } from "@/lib/api/types"
import { apiBase } from "@/lib/api/env"
import { toast } from "sonner"

export function ProjectOverview({ project }: { project: Project }) {
  const [name, setName] = React.useState(project.name)
  const [description, setDescription] = React.useState(project.description ?? "")
  const [readme, setReadme] = React.useState<{ exists: boolean; markdown: string } | null>(null)

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

  React.useEffect(() => {
    const b = apiBase()
    if (!b) return
    let cancelled = false
    fetch(`${b}/projects/${project.id}/readme`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: { exists?: boolean; markdown?: string } } | null) => {
        if (cancelled) return
        setReadme({
          exists: j?.data?.exists === true,
          markdown: String(j?.data?.markdown ?? ""),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [project.id])

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
              <p className="mt-1">
                <span className="text-muted-foreground">Branch: </span>
                {project.defaultBranch ?? "—"}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground">
              This folder is not a Git repository. RepoPilot will not run Git
              commands for this project.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-medium text-foreground">README.md</h2>
        {!readme ? (
          <p className="text-[12px] text-muted-foreground">Loading…</p>
        ) : !readme.exists ? (
          <p className="text-[12px] text-muted-foreground">No README.md found in this project.</p>
        ) : (
          <div className="prose prose-invert max-w-none rounded-lg border border-border bg-muted/20 p-4 text-[13px]">
            <ReactMarkdown>{readme.markdown}</ReactMarkdown>
          </div>
        )}
      </section>
    </div>
  )
}
