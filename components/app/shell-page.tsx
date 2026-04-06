import { cn } from "@/lib/utils"

/**
 * Standard width shell for pages under AppShell `main` (already has horizontal padding).
 * Left-aligned so the content edge lines up with the app header title — avoids different
 * `max-w-*` + `mx-auto` combos shifting the gutter between routes.
 */
const shellPageMaxWidth = {
  narrow: "max-w-xl",
  comfortable: "max-w-2xl",
  standard: "max-w-3xl",
  wide: "max-w-6xl",
} as const

export type ShellPageMaxWidth = keyof typeof shellPageMaxWidth

export function ShellPage({
  children,
  maxWidth = "standard",
  className,
}: {
  children: React.ReactNode
  maxWidth?: ShellPageMaxWidth
  className?: string
}) {
  return (
    <div className={cn("w-full", shellPageMaxWidth[maxWidth], className)}>{children}</div>
  )
}
