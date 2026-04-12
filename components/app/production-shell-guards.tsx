"use client"

import * as React from "react"

/**
 * Suppresses the native webview/browser context menu (Reload, Back, Inspect, etc.)
 * in production builds only. Desktop (Tauri) and hosted Next both use NODE_ENV.
 */
export function ProductionShellGuards() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    document.addEventListener("contextmenu", onContextMenu, { capture: true })
    return () =>
      document.removeEventListener("contextmenu", onContextMenu, { capture: true })
  }, [])

  return null
}
