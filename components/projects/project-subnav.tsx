"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = (projectId: string) =>
  [
    { href: `/projects/${projectId}`, label: "Overview" },
    { href: `/projects/${projectId}/board`, label: "Board" },
    { href: `/projects/${projectId}/runs`, label: "Run history" },
  ] as const

export function ProjectSubnav({ projectId }: { projectId: string }) {
  const pathname = usePathname()

  return (
    <div className="mb-6 flex w-fit gap-1 rounded-lg bg-muted p-[3px]">
      {tabs(projectId).map((t) => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
