"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { Check, Clock, Eye, Minus, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/** Status pills: neutral border; meaning from text + icon color (same idea as `failed` + destructive). */
const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      status: {
        pending: "text-muted-foreground [&_svg]:text-muted-foreground",
        queued: "text-violet-300 [&_svg]:text-violet-300",
        waiting: "text-violet-300 [&_svg]:text-violet-300",
        in_progress:
          "bg-muted/50 text-sky-300 [&_svg]:text-sky-300",
        active: "bg-muted/50 text-emerald-400 [&_svg]:text-emerald-400",
        running: "bg-muted/50 text-amber-300 [&_svg]:text-amber-300",
        review: "text-amber-300 [&_svg]:text-amber-300",
        done: "text-emerald-400 [&_svg]:text-emerald-400",
        success: "text-emerald-400 [&_svg]:text-emerald-400",
        failed: "text-destructive [&_svg]:text-destructive/90",
        skipped:
          "border-border/60 bg-muted/25 italic text-muted-foreground [&_svg]:text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

const pulseStatuses = new Set(["in_progress", "active", "running"])

function StatusDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("size-1.5 shrink-0 rounded-full bg-current", className)}
      aria-hidden
    />
  )
}

function StatusBadge({
  className,
  status,
  children,
  showIcon = true,
}: VariantProps<typeof statusBadgeVariants> & {
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
}) {
  const s = status ?? "pending"
  const pulse = pulseStatuses.has(s as string)

  const icon = !showIcon ? null : s === "queued" || s === "waiting" ? (
    <Clock className="size-3 opacity-80" strokeWidth={2} />
  ) : s === "in_progress" ? (
    <StatusDot className={cn("bg-sky-400", pulse && "animate-pulse")} />
  ) : s === "running" ? (
    <StatusDot className={cn("bg-amber-400", pulse && "animate-pulse")} />
  ) : s === "active" ? (
    <StatusDot className={cn("bg-emerald-400", pulse && "animate-pulse")} />
  ) : s === "review" ? (
    <Eye className="size-3 opacity-90" strokeWidth={2} />
  ) : s === "done" || s === "success" ? (
    <Check className="size-3" strokeWidth={2.5} />
  ) : s === "failed" ? (
    <XCircle className="size-3" strokeWidth={2} />
  ) : s === "skipped" ? (
    <Minus className="size-3 opacity-60" strokeWidth={2} />
  ) : s === "pending" ? (
    <StatusDot className="opacity-50" />
  ) : null

  return (
    <span
      data-status={s}
      className={cn(statusBadgeVariants({ status: s }), className)}
    >
      {icon}
      {children ?? formatLabel(s)}
    </span>
  )
}

function formatLabel(status: string) {
  const s = status.replace(/_/g, " ")
  if (!s.length) return s
  return s[0]!.toUpperCase() + s.slice(1)
}

export { StatusBadge, statusBadgeVariants, StatusDot, formatLabel }
