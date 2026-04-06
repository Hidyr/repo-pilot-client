"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  FolderOpen,
  ListOrdered,
  Bot,
  Settings,
  Rocket,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DUMMY_QUEUE, queueBadgeCount, getProject } from "@/lib/dummy-data"
import { QueueStatusBar } from "@/components/app/queue-status-bar"

function AppHeader() {
  const pathname = usePathname()
  const params = useParams()
  const projectId = params.projectId as string | undefined

  const title = React.useMemo(() => {
    if (pathname === "/projects" || pathname === "/") return "Projects"
    if (pathname === "/queue") return "Queue"
    if (pathname === "/agents") return "Agents"
    if (pathname === "/settings") return "Settings"
    if (projectId) {
      const p = getProject(projectId)
      const name = p?.name ?? "Project"
      if (pathname.endsWith("/automation")) return `${name} · Automation`
      if (pathname.endsWith("/board")) return `${name} · Board`
      if (pathname.endsWith("/runs")) return `${name} · Run history`
      return `${name} · Overview`
    }
    return "RepoPilot"
  }, [pathname, projectId])

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border bg-background/75 px-6 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <h1 className="text-[15px] font-medium tracking-tight text-foreground">
        {title}
      </h1>
    </header>
  )
}

function NavLink({
  href,
  icon: Icon,
  children,
  badge,
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  badge?: number
}) {
  const pathname = usePathname()
  const active =
    href === "/projects"
      ? pathname === "/projects" || pathname.startsWith("/projects/")
      : pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-3.5 shrink-0 opacity-70",
          active ? "text-sidebar-accent-foreground" : "text-muted-foreground"
        )}
        strokeWidth={1.5}
      />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {children}
        {badge != null && badge > 0 ? (
          <Badge
            variant="secondary"
            className="h-5 min-w-5 justify-center px-1.5 text-[10px] font-medium"
          >
            {badge}
          </Badge>
        ) : null}
      </span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const q = DUMMY_QUEUE
  const badge = queueBadgeCount(q)

  return (
    <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-[220px] shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar py-3">
          <div className="mb-4 flex items-center gap-2 px-4">
            <Rocket className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[13px] font-medium text-sidebar-foreground">
              RepoPilot
            </span>
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            <NavLink href="/projects" icon={FolderOpen}>
              Projects
            </NavLink>
            <NavLink href="/queue" icon={ListOrdered} badge={badge}>
              Queue
            </NavLink>
            <NavLink href="/agents" icon={Bot}>
              Agents
            </NavLink>
            <NavLink href="/settings" icon={Settings}>
              Settings
            </NavLink>
          </nav>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          {/*
            Horizontal padding matches header (px-6). Route bodies should use ShellPage
            for max-width — avoids mixed mx-auto + max-w-* shifting content vs the sidebar.
          */}
          <main className="min-h-0 flex-1 overflow-auto overscroll-contain px-6 py-6">
            {children}
          </main>
        </div>
      </div>
      <QueueStatusBar />
    </div>
  )
}
