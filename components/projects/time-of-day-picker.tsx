"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const HOUR_OPTS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
)
const MINUTE_OPTS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
)

export function parseHHMM(raw: string): { h: string; m: string } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw.trim())
  if (!m) return { h: "09", m: "00" }
  let h = Number(m[1])
  let min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min)) return { h: "09", m: "00" }
  h = Math.min(23, Math.max(0, Math.floor(h)))
  min = Math.min(59, Math.max(0, Math.floor(min)))
  return { h: String(h).padStart(2, "0"), m: String(min).padStart(2, "0") }
}

export function formatHHMM(h: string, m: string): string {
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`
}

type TimeOfDayPickerProps = {
  value: string
  onChange: (next: string) => void
  "aria-label"?: string
  className?: string
}

function TimeListColumn({
  label,
  options,
  selected,
  onPick,
  listRef,
  dataPrefix,
}: {
  label: string
  options: readonly string[]
  selected: string
  onPick: (v: string) => void
  listRef: React.RefObject<HTMLDivElement | null>
  dataPrefix: "hour" | "minute"
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col toluwap">
      <div className="shrink-0 border-b border-border bg-popover px-2 py-1.5 text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div
        ref={listRef}
        className="max-h-[calc(7*1.75rem)] overflow-y-auto overscroll-contain py-0.5"
        role="listbox"
        aria-label={label}
      >
        {options.map((opt) => {
          const isSel = opt === selected
          return (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={isSel}
              data-time-col={dataPrefix}
              data-time-value={opt}
              onClick={() => onPick(opt)}
              className={cn(
                "flex h-7 min-h-7 w-full shrink-0 cursor-default items-center justify-center px-3 font-mono text-sm leading-none tabular-nums outline-none select-none",
                "hover:bg-accent hover:text-accent-foreground",
                isSel && "bg-accent/80 text-accent-foreground"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TimeOfDayPicker({
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: TimeOfDayPickerProps) {
  const { h, m } = parseHHMM(value)
  const [open, setOpen] = React.useState(false)
  const hourListRef = React.useRef<HTMLDivElement>(null)
  const minuteListRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (!open) return
    const scrollOne = (
      container: HTMLDivElement | null,
      prefix: "hour" | "minute",
      v: string
    ) => {
      const el = container?.querySelector(
        `[data-time-col="${prefix}"][data-time-value="${v}"]`
      )
      el?.scrollIntoView({ block: "center" })
    }
    const id = window.requestAnimationFrame(() => {
      scrollOne(hourListRef.current, "hour", h)
      scrollOne(minuteListRef.current, "minute", m)
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, h, m])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        type="button"
        nativeButton
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-8 min-w-[5.5rem] items-center justify-between gap-1.5 rounded-md border border-input bg-background px-2.5 font-mono text-xs tabular-nums shadow-xs transition-[color,box-shadow] outline-none select-none",
          "hover:bg-muted/50 dark:bg-input/30 dark:hover:bg-input/50",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35",
          "data-popup-open:border-ring data-popup-open:ring-2 data-popup-open:ring-ring/35",
          className
        )}
      >
        <span>{formatHHMM(h, m)}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={4}>
          <Popover.Popup
            initialFocus={false}
            className={cn(
              "z-50 w-[min(100vw-1rem,11rem)] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            )}
          >
            <div className="flex divide-x divide-border">
              <TimeListColumn
                label="Hour"
                options={HOUR_OPTS}
                selected={h}
                listRef={hourListRef}
                dataPrefix="hour"
                onPick={(nextH) => onChange(formatHHMM(nextH, m))}
              />
              <TimeListColumn
                label="Min"
                options={MINUTE_OPTS}
                selected={m}
                listRef={minuteListRef}
                dataPrefix="minute"
                onPick={(nextM) => onChange(formatHHMM(h, nextM))}
              />
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
