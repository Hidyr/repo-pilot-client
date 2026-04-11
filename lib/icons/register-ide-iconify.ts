import { addCollection, type IconifyJSON } from "@iconify/react/offline"

import deviconPlainIdeSlice from "@/lib/icons/devicon-plain-ide-slice.json"
import antigravitySlice from "@/lib/icons/material-symbols-antigravity-slice.json"

/** SVG data from Iconify: devicon-plain (grey) + material-symbols antigravity-outline. @see https://icon-sets.iconify.design/ */

let registered = false

export function registerIdeIconifyIcons(): void {
  if (registered) return
  registered = true
  addCollection(deviconPlainIdeSlice as IconifyJSON)
  addCollection(antigravitySlice as IconifyJSON)
}
