"use client"

/** Syncs the Tauri shell’s close behavior with the given value (desktop only). */
export async function setNativeMinimizeToTray(enabled: boolean): Promise<boolean> {
  try {
    const core = await import("@tauri-apps/api/core")
    await core.invoke("set_minimize_to_tray", { enabled })
    return true
  } catch {
    return false
  }
}

/** Reads minimize-to-tray from the Tauri shell, or `null` when not in the desktop app. */
export async function getNativeMinimizeToTray(): Promise<boolean | null> {
  try {
    const core = await import("@tauri-apps/api/core")
    return await core.invoke<boolean>("get_minimize_to_tray")
  } catch {
    return null
  }
}
