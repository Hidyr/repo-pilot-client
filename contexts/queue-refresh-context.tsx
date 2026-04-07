"use client"

import * as React from "react"

const QueueRefreshContext = React.createContext<(() => Promise<void>) | null>(null)

export function QueueRefreshProvider({
  refresh,
  children,
}: {
  refresh: () => Promise<void>
  children: React.ReactNode
}) {
  return (
    <QueueRefreshContext.Provider value={refresh}>{children}</QueueRefreshContext.Provider>
  )
}

export function useQueueRefresh() {
  return React.useContext(QueueRefreshContext)
}
