/** Base URL without trailing slash, e.g. http://localhost:3579/api — from NEXT_PUBLIC_API_BASE */
export function apiBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_BASE
  if (!raw?.trim()) return null
  return raw.replace(/\/$/, "")
}

export function isApiConfigured(): boolean {
  return apiBase() != null
}
