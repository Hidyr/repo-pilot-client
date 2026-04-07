"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  Bot,
  FolderOpen,
  ListOrdered,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Settings,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QueueStatusBar } from "@/components/app/queue-status-bar"
import { QueueRefreshProvider } from "@/contexts/queue-refresh-context"
import { apiBase } from "@/lib/api/env"
import { useQueueStream } from "@/hooks/use-queue-stream"
import type { QueueSnapshot } from "@/lib/api/types"

function queueBadgeCount(q: QueueSnapshot): number {
  return q.activeSlots + q.waitingCount
}

const SIDEBAR_COLLAPSED_KEY = "repopilot-sidebar-collapsed"

function AppHeader({
  onOpenMobileNav,
  sidebarCollapsed,
  onToggleSidebarCollapse,
}: {
  onOpenMobileNav: () => void
  sidebarCollapsed: boolean
  onToggleSidebarCollapse: () => void
}) {
  const pathname = usePathname()
  const params = useParams()
  const projectId = params.projectId as string | undefined

  const [apiProjectName, setApiProjectName] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!projectId) {
      setApiProjectName(null)
      return
    }
    const b = apiBase()
    if (!b) {
      setApiProjectName(null)
      return
    }
    let cancelled = false
    fetch(`${b}/projects/${projectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: { name?: string } } | null) => {
        if (!cancelled && j?.data?.name) setApiProjectName(j.data.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [projectId])

  const title = React.useMemo(() => {
    if (pathname === "/projects" || pathname === "/") return "Projects"
    if (pathname === "/queue") return "Queue"
    if (pathname === "/agents") return "Agents"
    if (pathname === "/settings") return "Settings"
    if (projectId) {
      const name = apiProjectName ?? "Project"
      if (pathname.endsWith("/automation")) return `${name} · Automation`
      if (pathname.endsWith("/board")) return `${name} · Board`
      if (pathname.endsWith("/runs")) return `${name} · Run history`
      return `${name} · Overview`
    }
    return "RepoPilot"
  }, [pathname, projectId, apiProjectName])

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/75 px-6 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open menu"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden size-8 shrink-0 p-0 md:inline-flex"
        onClick={onToggleSidebarCollapse}
        aria-expanded={!sidebarCollapsed}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="size-5" strokeWidth={1.5} />
        ) : (
          <PanelLeftClose className="size-5" strokeWidth={1.5} />
        )}
      </Button>
      <h1 className="min-w-0 flex-1 text-[15px] font-medium tracking-tight text-foreground md:flex-none">
        {title}
      </h1>
    </header>
  )
}

function NavLink({
  href,
  icon: Icon,
  label,
  badge,
  collapsed,
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
  collapsed: boolean
}) {
  const pathname = usePathname()
  const active =
    href === "/projects"
      ? pathname === "/projects" || pathname.startsWith("/projects/")
      : pathname === href || pathname.startsWith(href + "/")

  const showBadge = badge != null && badge > 0

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
        collapsed && "md:justify-center md:gap-0 md:px-2",
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
      <span
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2",
          collapsed && "md:sr-only"
        )}
      >
        {label}
        {showBadge ? (
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-5 justify-center px-1.5 text-[10px] font-medium",
              collapsed && "md:hidden"
            )}
          >
            {badge}
          </Badge>
        ) : null}
      </span>
      {showBadge && collapsed ? (
        <span className="absolute top-1.5 right-1.5 hidden size-2 md:block">
          <span className="block size-1.5 rounded-full bg-sidebar-primary" aria-hidden />
          <span className="sr-only">{badge} queued</span>
        </span>
      ) : null}
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { queue, refresh } = useQueueStream()
  const badge = queueBadgeCount(queue)
  const pathname = usePathname()

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
        setCollapsed(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mobileOpen])

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return (
    <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {mobileOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "flex shrink-0 flex-col border-r border-border bg-sidebar py-3",
            "transition-[width,transform] duration-200 ease-out",
            "absolute inset-y-0 left-0 z-30 w-[220px] md:static md:z-auto",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            collapsed ? "md:w-[52px]" : "md:w-[220px]"
          )}
        >
          <div
            className={cn(
              "mb-3 flex items-center gap-2 px-4",
              collapsed && "md:justify-center md:px-2"
            )}
          >
            <Rocket
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[13px] font-medium text-sidebar-foreground",
                collapsed && "md:hidden"
              )}
            >
              RepoPilot
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-4" strokeWidth={1.5} />
            </Button>
          </div>

          <nav
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2",
              collapsed && "md:px-1.5"
            )}
          >
            <NavLink
              href="/projects"
              icon={FolderOpen}
              label="Projects"
              collapsed={collapsed}
            />
            <NavLink
              href="/queue"
              icon={ListOrdered}
              label="Queue"
              badge={badge}
              collapsed={collapsed}
            />
            <NavLink href="/agents" icon={Bot} label="Agents" collapsed={collapsed} />
            <NavLink
              href="/settings"
              icon={Settings}
              label="Settings"
              collapsed={collapsed}
            />
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader
            onOpenMobileNav={() => setMobileOpen(true)}
            sidebarCollapsed={collapsed}
            onToggleSidebarCollapse={toggleCollapsed}
          />
          {/*
            Horizontal padding matches header (px-6). Route bodies should use ShellPage
            for max-width — avoids mixed mx-auto + max-w-* shifting content vs the sidebar.
          */}
          <QueueRefreshProvider queue={queue} refresh={refresh}>
            <main className="min-h-0 flex-1 overflow-auto overscroll-contain px-6 py-6">
              {children}
            </main>
          </QueueRefreshProvider>
        </div>
      </div>
      <QueueStatusBar queue={queue} onRefresh={refresh} />
    </div>
  )
}
