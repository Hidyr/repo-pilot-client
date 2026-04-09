"use client"

import * as React from "react"

import { runLogWebSocketUrl } from "@/lib/api/run-log-ws-url"
import { cn } from "@/lib/utils"

const RECONNECT_MS = 2000

function LogLine({ line }: { line: string }) {
  const m = line.match(/^(\[[^\]]+\])(.*)$/)
  if (!m) {
    return <div>{line}</div>
  }
  return (
    <div>
      <span className="text-foreground/70">{m[1]}</span>
      {m[2]}
    </div>
  )
}

export function RunLogLive({
  runId,
  initialLogs,
  status,
  expanded,
  className,
}: {
  runId: string
  initialLogs: string | null
  status: string
  expanded: boolean
  className?: string
}) {
  const [liveText, setLiveText] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const stream =
    expanded && (status === "running" || status === "queued")

  React.useEffect(() => {
    if (!stream) {
      setLiveText(null)
      return
    }

    setLiveText(null)

    const url = runLogWebSocketUrl(runId)
    if (!url) return

    let ws: WebSocket | null = null
    let closed = false
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const clearReconnect = () => {
      if (reconnectTimer != null) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    const connect = () => {
      if (closed) return
      clearReconnect()
      ws = new WebSocket(url)

      ws.onmessage = (ev) => {
        try {
          const j = JSON.parse(String(ev.data)) as {
            type?: string
            runId?: string
            logs?: string
            chunk?: string
          }
          if (j.runId !== runId) return
          if (j.type === "run_log_snapshot" && typeof j.logs === "string") {
            setLiveText(j.logs)
          }
          if (j.type === "run_log_append" && typeof j.chunk === "string") {
            setLiveText((prev) => (prev ?? initialLogs ?? "") + j.chunk)
          }
        } catch {
          /* ignore */
        }
      }

      ws.onclose = () => {
        if (closed) return
        reconnectTimer = setTimeout(connect, RECONNECT_MS)
      }

      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()
    return () => {
      closed = true
      clearReconnect()
      ws?.close()
      setLiveText(null)
    }
  }, [runId, stream, initialLogs])

  const text = stream ? (liveText ?? initialLogs ?? "") : (initialLogs ?? "")

  const lines = text
    .split("\n")
    .map((x) => x.trimEnd())
    .filter(Boolean)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el || !stream) return
    el.scrollTop = el.scrollHeight
  }, [lines.length, stream])

  return (
    <div
      ref={scrollRef}
      className={cn(
        "max-h-[400px] overflow-auto rounded-md border border-border bg-muted/20 p-3",
        "font-mono text-[11px] leading-relaxed text-muted-foreground",
        className
      )}
    >
      {lines.length ? (
        lines.map((line, i) => <LogLine key={i} line={line} />)
      ) : (
        <div>{stream ? "(waiting for log output…)" : "(no logs)"}</div>
      )}
    </div>
  )
}
