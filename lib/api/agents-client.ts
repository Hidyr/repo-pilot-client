import { apiBase } from "@/lib/api/env"
import type { Agent } from "@/lib/api/types"

function parseError(j: unknown): string {
  if (j && typeof j === "object" && "error" in j) {
    const e = (j as { error?: { message?: string } }).error
    return e?.message ?? "Request failed"
  }
  return "Request failed"
}

export async function listAgents(): Promise<
  { ok: true; agents: Agent[] } | { ok: false; message: string }
> {
  const b = apiBase()
  if (!b) return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  try {
    const res = await fetch(`${b}/agents`)
    const j = (await res.json().catch(() => null)) as { data?: Agent[] } | null
    if (!res.ok) return { ok: false, message: parseError(j) }
    return { ok: true, agents: j?.data ?? [] }
  } catch {
    return { ok: false, message: "Network error" }
  }
}

export async function updateAgent(
  id: string,
  patch: { enabled: boolean }
): Promise<{ ok: true; agent: Agent } | { ok: false; message: string }> {
  const b = apiBase()
  if (!b) return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  try {
    const res = await fetch(`${b}/agents/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const j = (await res.json().catch(() => null)) as { data?: Agent } | null
    if (!res.ok) return { ok: false, message: parseError(j) }
    if (!j?.data) return { ok: false, message: "Invalid response" }
    return { ok: true, agent: j.data }
  } catch {
    return { ok: false, message: "Network error" }
  }
}

export async function testAgent(
  id: string
): Promise<
  | { ok: true; message: string }
  | { ok: false; error: string }
  | { ok: false; message: string }
> {
  const b = apiBase()
  if (!b) return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  try {
    const res = await fetch(`${b}/agents/${encodeURIComponent(id)}/test`, {
      method: "POST",
    })
    const j = (await res.json().catch(() => null)) as {
      success?: boolean
      message?: string
      error?: string
    } | null
    if (!res.ok) return { ok: false, message: parseError(j) }
    if (j?.success) return { ok: true, message: j.message ?? "OK" }
    return { ok: false, error: j?.error ?? "Test failed" }
  } catch {
    return { ok: false, message: "Network error" }
  }
}

export async function deactivateAgent(
  id: string
): Promise<{ ok: true; agent: Agent } | { ok: false; message: string }> {
  const b = apiBase()
  if (!b) return { ok: false, message: "Backend not configured (NEXT_PUBLIC_API_BASE)" }
  try {
    const res = await fetch(`${b}/agents/${encodeURIComponent(id)}/deactivate`, {
      method: "POST",
    })
    const j = (await res.json().catch(() => null)) as { data?: Agent } | null
    if (!res.ok) return { ok: false, message: parseError(j) }
    if (!j?.data) return { ok: false, message: "Invalid response" }
    return { ok: true, agent: j.data }
  } catch {
    return { ok: false, message: "Network error" }
  }
}

type StreamChunk = {
  t: string
  stream?: "stdout" | "stderr"
  data?: string
  meta?: boolean
  ok?: boolean
  message?: string
  error?: string
}

function parseNdjsonLine(
  line: string,
  opts: {
    onChunk: (text: string, stream: "stdout" | "stderr", meta?: boolean) => void
    onDone: (r: { ok: true; message: string } | { ok: false; error: string }) => void
  }
): boolean {
  if (!line.trim()) return false
  let row: StreamChunk
  try {
    row = JSON.parse(line) as StreamChunk
  } catch {
    return false
  }
  if (row.t === "chunk" && typeof row.data === "string" && row.stream) {
    opts.onChunk(row.data, row.stream, row.meta === true)
  }
  if (row.t === "done") {
    if (row.ok === true && typeof row.message === "string") {
      opts.onDone({ ok: true, message: row.message })
    } else {
      opts.onDone({
        ok: false,
        error: typeof row.error === "string" ? row.error : "Test failed",
      })
    }
    return true
  }
  return false
}

/**
 * Streams NDJSON from POST /agents/:id/test/stream until a `{ t: "done", ... }` line.
 */
export async function testAgentStream(
  id: string,
  opts: {
    signal?: AbortSignal
    onChunk: (text: string, stream: "stdout" | "stderr", meta?: boolean) => void
    onDone: (r: { ok: true; message: string } | { ok: false; error: string }) => void
    onRequestError: (message: string) => void
  }
): Promise<void> {
  const b = apiBase()
  if (!b) {
    opts.onRequestError("Backend not configured (NEXT_PUBLIC_API_BASE)")
    return
  }
  let res: Response
  try {
    res = await fetch(`${b}/agents/${encodeURIComponent(id)}/test/stream`, {
      method: "POST",
      signal: opts.signal,
    })
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return
    opts.onRequestError("Network error")
    return
  }

  if (!res.ok || !res.body) {
    const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    opts.onRequestError(parseError(j))
    return
  }

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ""
  let finished = false

  const onDone = (r: { ok: true; message: string } | { ok: false; error: string }) => {
    finished = true
    opts.onDone(r)
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (value) {
        buf += dec.decode(value, { stream: !done })
      } else if (done) {
        // Flush any pending decoder state.
        buf += dec.decode()
      }
      const lines = buf.split("\n")
      buf = lines.pop() ?? ""
      for (const line of lines) {
        if (parseNdjsonLine(line, { onChunk: opts.onChunk, onDone })) {
          return
        }
      }
      if (done) break
    }
    if (buf.trim()) {
      if (parseNdjsonLine(buf, { onChunk: opts.onChunk, onDone })) {
        return
      }
    }
    if (!finished) {
      opts.onRequestError("Stream ended unexpectedly")
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return
    opts.onRequestError((e as Error)?.message ?? "Stream read failed")
  } finally {
    reader.releaseLock()
  }
}
