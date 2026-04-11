"use client"

import * as React from "react"
import { FolderOpen, LayoutGrid, List, Search } from "lucide-react"

import { AddProjectDialog } from "@/components/projects/add-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import type { Project } from "@/lib/api/types"
import {
  EMPTY_IDE_CLIS,
  fetchAvailableIdeClis,
  type AvailableIdeClis,
} from "@/lib/os/ide-cli"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ProjectFilter = "all" | "git" | "local" | "active"

const FILTER_LABELS: Record<ProjectFilter, string> = {
  all: "All",
  git: "Git",
  local: "Local",
  active: "Running",
}

const LAYOUT_STORAGE_KEY = "repopilot-projects-layout"

const FILTER_ORDER: ProjectFilter[] = ["all", "git", "local", "active"]

export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<ProjectFilter>("all")
  const [layout, setLayout] = React.useState<string[]>(["list"])
  const [ideClis, setIdeClis] = React.useState<AvailableIdeClis>({ ...EMPTY_IDE_CLIS })

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY)
      if (stored === "grid" || stored === "list") {
        setLayout([stored])
      }
    } catch {
      /* ignore */
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      const { isTauri } = await import("@tauri-apps/api/core")
      if (!isTauri() || cancelled) return
      const v = await fetchAvailableIdeClis()
      if (!cancelled) setIdeClis(v)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setLayoutMode = React.useCallback((next: string[]) => {
    if (next.length === 0) return
    const v = next[next.length - 1]!
    setLayout([v])
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, v)
    } catch {
      /* ignore */
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = React.useMemo(() => {
    return projects.filter((p) => {
      if (filter === "git" && !p.isGitRepo) return false
      if (filter === "local" && p.isGitRepo) return false
      if (filter === "active" && !p.hasActiveRun) return false

      if (!normalizedQuery) return true
      const hay = `${p.name} ${p.localPath} ${p.description}`.toLowerCase()
      return hay.includes(normalizedQuery)
    })
  }, [projects, filter, normalizedQuery])

  const isGrid = layout[0] === "grid"
  const hasProjects = projects.length > 0

  if (!hasProjects) {
    return (
      <>
        <div className="mb-6 flex items-center justify-end gap-4">
          <AddProjectDialog />
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderOpen className="mb-3 size-10 text-muted-foreground" strokeWidth={1.25} />
          <p className="text-[15px] font-medium text-foreground">Add your first repository</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            Connect a local folder or clone a Git repo to start scheduling features.
          </p>
          <div className="mt-6">
            <AddProjectDialog />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-[13px] text-muted-foreground lg:max-w-md">
          Local-first projects and feature automation.
        </p>
        <AddProjectDialog />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
          <Label htmlFor="project-search" className="sr-only">
            Search projects
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="project-search"
            type="search"
            placeholder="Search name, path…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 border-border bg-card pr-3 pl-8 text-[13px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[filter]}
            onValueChange={(next) => {
              if (next.length > 0) {
                setFilter(next[next.length - 1]! as ProjectFilter)
              }
            }}
            className="min-w-0"
          >
            {FILTER_ORDER.map((key) => (
              <ToggleGroupItem
                key={key}
                value={key}
                className="px-2.5 text-xs data-[pressed]:z-10"
              >
                {FILTER_LABELS[key]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <ToggleGroup
            variant="outline"
            spacing={0}
            value={layout}
            onValueChange={setLayoutMode}
            className="shrink-0"
            aria-label="Layout"
          >
            <ToggleGroupItem
              value="list"
              size="sm"
              className="px-2"
              aria-label="List view"
            >
              <List className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grid"
              size="sm"
              className="px-2"
              aria-label="Grid view"
            >
              <LayoutGrid className="size-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-10 text-center text-[13px] text-muted-foreground">
          No projects match your search or filters.
        </p>
      ) : (
        <ul
          className={cn(
            "gap-3",
            isGrid
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {filtered.map((p) => (
            <li key={p.id} className={cn(isGrid && "h-full min-h-0")}>
              <ProjectCard
                project={p}
                layout={isGrid ? "grid" : "list"}
                ideClis={ideClis}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
