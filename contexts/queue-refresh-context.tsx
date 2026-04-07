"use client"

import * as React from "react"

import type { QueueSnapshot } from "@/lib/dummy-data"

type QueueShellValue = {
  queue: QueueSnapshot
  refresh: () => Promise<void>
}

const QueueShellContext = React.createContext<QueueShellValue | null>(null)

export function QueueRefreshProvider({
  queue,
  refresh,
  children,
}: {
  queue: QueueSnapshot
  refresh: () => Promise<void>
  children: React.ReactNode
}) {
  return (
    <QueueShellContext.Provider value={{ queue, refresh }}>
      {children}
    </QueueShellContext.Provider>
  )
}

export function useQueueRefresh() {
  return React.useContext(QueueShellContext)?.refresh ?? null
}

/** Live queue from the app shell (same WebSocket as the status bar). */
export function useAppQueue() {
  return React.useContext(QueueShellContext)
}
