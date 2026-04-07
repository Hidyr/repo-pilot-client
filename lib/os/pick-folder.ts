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
  } catch {
    toast.message("Folder picker is desktop-only", {
      description: "This requires the Tauri desktop shell.",
    })
    return null
  }
}

