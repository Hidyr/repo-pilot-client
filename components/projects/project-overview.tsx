"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Project } from "@/lib/dummy-data"

export function ProjectOverview({ project }: { project: Project }) {
  const [name, setName] = React.useState(project.name)
  const [description, setDescription] = React.useState(project.description)

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-name">Name</Label>
          <Input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-desc">Description</Label>
          <Input
            id="p-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                {project.branch}
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
        <pre className="max-h-[320px] overflow-auto rounded-lg border border-border bg-muted/20 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {project.readmeExcerpt}
        </pre>
      </section>
    </div>
  )
}
