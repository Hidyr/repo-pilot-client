"use client"

import { toast } from "sonner"

export type IdeId = "vscode" | "cursor" | "antigravity" | "intellij"

export type AvailableIdeClis = Record<IdeId, boolean>

export const EMPTY_IDE_CLIS: AvailableIdeClis = {
  vscode: false,
  cursor: false,
  antigravity: false,
  intellij: false,
}

export async function fetchAvailableIdeClis(): Promise<AvailableIdeClis> {
  try {
    const core = await import("@tauri-apps/api/core")
    return await core.invoke<AvailableIdeClis>("get_available_ide_clis")
  } catch {
    return { ...EMPTY_IDE_CLIS }
  }
}

export async function openProjectInIde(ide: IdeId, localPath: string): Promise<void> {
  try {
    const core = await import("@tauri-apps/api/core")
    await core.invoke("open_project_in_ide", { ide, path: localPath })
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error"
    toast.error("Could not open in editor", {
      description:
        msg.includes("invoke") || msg.includes("not allowed")
          ? "Opening folders in an IDE requires the RepoPilot desktop app."
          : msg,
    })
  }
}
