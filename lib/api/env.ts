/** Base URL without trailing slash, e.g. http://localhost:3579/api — from NEXT_PUBLIC_API_BASE */
export function apiBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_BASE
  if (raw?.trim()) return raw.replace(/\/$/, "")
  // If `NEXT_PUBLIC_*` was not inlined, recover using env baked for packaged desktop only.
  if (typeof window !== "undefined") {
    const { hostname, port } = window.location
    if (hostname === "127.0.0.1" || hostname === "localhost") {
      const pApi = process.env.NEXT_PUBLIC_PACKAGED_API_PORT
      const pUi = process.env.NEXT_PUBLIC_PACKAGED_UI_PORT
      if (pApi && pUi && port === pUi) {
        return `http://127.0.0.1:${pApi}/api`.replace(/\/$/, "")
      }
      // Dev: Next on 3000 (or Tauri dev 1420), API on 3579
      if (port === "3000" || port === "1420") {
        return "http://127.0.0.1:3579/api"
      }
    }
  }
  return null
}

export function isApiConfigured(): boolean {
  return apiBase() != null
}
