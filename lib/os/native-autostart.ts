"use client"

/** Registers or removes OS login autostart (desktop only). Uses `--startup-tray` so the window stays hidden until opened from the tray. */
export async function setNativeAutostart(enabled: boolean): Promise<boolean> {
  try {
    const { enable, disable } = await import("@tauri-apps/plugin-autostart")
    if (enabled) {
      await enable()
    } else {
      await disable()
    }
    return true
  } catch {
    return false
  }
}

/** Returns whether autostart is registered with the OS, or `null` outside the Tauri shell. */
export async function getNativeAutostartEnabled(): Promise<boolean | null> {
  try {
    const { isEnabled } = await import("@tauri-apps/plugin-autostart")
    return await isEnabled()
  } catch {
    return null
  }
}
