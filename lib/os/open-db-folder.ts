"use client"

import { toast } from "sonner"

export async function openDbFolder(): Promise<void> {
  try {
    const core = await import("@tauri-apps/api/core")
    await core.invoke("open_db_folder")
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error"
    toast.message("Not available yet", {
      description:
        msg.includes("invoke") || msg.includes("not allowed")
          ? "Opening the DB folder requires the Tauri desktop shell."
          : msg,
    })
  }
}

