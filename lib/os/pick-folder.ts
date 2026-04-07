import { toast } from "sonner"

/**
 * Returns an absolute folder path in desktop (Tauri) builds.
 * In a pure web build, absolute filesystem paths aren't available.
 */
export async function pickFolder(): Promise<string | null> {
  try {
    const mod = await import("@tauri-apps/plugin-dialog")
    const selected = await mod.open({
      directory: true,
      multiple: false,
      title: "Select folder",
    })
    if (!selected) return null
    return Array.isArray(selected) ? (selected[0] ?? null) : selected
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error"
    console.error("[pickFolder]", e)
    toast.message("Could not open folder picker", {
      description:
        msg.includes("invoke") || msg.includes("not allowed")
          ? "Tauri IPC may be blocked — use `bun run desktop:dev` and ensure the app URL matches devUrl (127.0.0.1:3000)."
          : msg,
    })
    return null
  }
}

