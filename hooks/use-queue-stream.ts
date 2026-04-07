"use client"

import * as React from "react"

import { apiBase } from "@/lib/api/env"
import { mapQueueApiToSnapshot } from "@/lib/api/queue-mapper"
import { queueWebSocketUrl } from "@/lib/api/queue-ws-url"
import { DUMMY_QUEUE, type QueueSnapshot } from "@/lib/dummy-data"

const RECONNECT_MS = 2000

export function useQueueStream(): {
  queue: QueueSnapshot
  refresh: () => Promise<void>
} {
  const [queue, setQueue] = React.useState<QueueSnapshot>(DUMMY_QUEUE)

  const refresh = React.useCallback(async () => {
    const b = apiBase()
    if (!b) {
      setQueue(DUMMY_QUEUE)
      return
    }
    try {
      const r = await fetch(`${b}/queue`)
      if (!r.ok) return
      const j = (await r.json()) as { data: Parameters<typeof mapQueueApiToSnapshot>[0] }
      if (j.data) setQueue(mapQueueApiToSnapshot(j.data))
    } catch {
      /* ignore */
    }
  }, [])

  React.useEffect(() => {
    const wsUrl = queueWebSocketUrl()
    if (!wsUrl) {
      setQueue(DUMMY_QUEUE)
      return
    }

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
      ws = new WebSocket(wsUrl)

      ws.onmessage = (ev) => {
        try {
          const j = JSON.parse(String(ev.data)) as {
            type?: string
            data?: Parameters<typeof mapQueueApiToSnapshot>[0]
          }
          if (j.type === "queue" && j.data) setQueue(mapQueueApiToSnapshot(j.data))
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
    }
  }, [])

  return { queue, refresh }
}
