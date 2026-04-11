"use client"

import * as React from "react"

import { boardWebSocketUrl } from "@/lib/api/board-ws-url"
import { mapFeatureRow } from "@/lib/api/map-feature"
import type { Feature } from "@/lib/api/types"

const RECONNECT_MS = 2000

export function useBoardStream(projectId: string, initial: Feature[]) {
  const [features, setFeatures] = React.useState<Feature[]>(initial)

  React.useEffect(() => {
    setFeatures(initial)
  }, [initial])

  React.useEffect(() => {
    const wsUrl = boardWebSocketUrl(projectId)
    if (!wsUrl) return

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
            projectId?: string
            data?: { features?: Feature[] }
          }
          if (j.type !== "board") return
          if (j.projectId && j.projectId !== projectId) return
          const next = j.data?.features
          if (Array.isArray(next)) {
            setFeatures(next.map((r) => mapFeatureRow(r as Record<string, unknown>)))
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
    }
  }, [projectId])

  return { features }
}

