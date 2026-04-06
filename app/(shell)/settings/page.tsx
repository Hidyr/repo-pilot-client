"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowText,
} from "@/components/design-system/settings-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const themeSegment =
    mounted && resolvedTheme === "light" ? "light" : "dark"

  const [maxRuns, setMaxRuns] = React.useState<string[]>(["4"])
  const [minimizeTray, setMinimizeTray] = React.useState(true)
  const [autostart, setAutostart] = React.useState(false)

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          General
        </h2>
        <SettingsGroup>
          <SettingsRow>
            <SettingsRowText title="Theme" description="UI appearance" />
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={[themeSegment]}
              onValueChange={(next) => {
                if (next.length > 0) {
                  const v = next[next.length - 1]
                  if (v === "light" || v === "dark") setTheme(v)
                }
              }}
            >
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
            </ToggleGroup>
          </SettingsRow>
          <SettingsRow className="items-start">
            <div className="min-w-0 flex-1">
              <Label className="text-[13px] text-foreground">Max concurrent runs</Label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Segmented control — only one value at a time (1–4).
              </p>
            </div>
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={maxRuns}
              onValueChange={(next) => {
                if (next.length > 0) setMaxRuns([next[next.length - 1]!])
              }}
              className="shrink-0"
            >
              {(["1", "2", "3", "4"] as const).map((n) => (
                <ToggleGroupItem key={n} value={n}>
                  {n}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingsRow>
        </SettingsGroup>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Background &amp; startup
        </h2>
        <SettingsGroup>
          <SettingsRow className="items-start">
            <SettingsRowText
              title="Minimize to tray on close"
              description="Closing the window hides the app to your system tray. Right-click the tray icon to quit."
            />
            <Checkbox
              checked={minimizeTray}
              onCheckedChange={(c) => setMinimizeTray(c === true)}
            />
          </SettingsRow>
          <SettingsRow className="items-start">
            <SettingsRowText
              title="Launch RepoPilot on system startup"
              description="App will start silently in the tray on login."
            />
            <Checkbox
              checked={autostart}
              onCheckedChange={(c) => setAutostart(c === true)}
            />
          </SettingsRow>
        </SettingsGroup>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          About
        </h2>
        <SettingsGroup>
          <SettingsRow>
            <SettingsRowText title="Version" description="1.0.0" />
          </SettingsRow>
          <SettingsRow>
            <SettingsRowText
              title="Database"
              description="~/.repopilot/repopilot.db"
            />
          </SettingsRow>
          <SettingsRow>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.message("Open DB folder (demo)")}
            >
              Open DB folder
            </Button>
          </SettingsRow>
        </SettingsGroup>
      </section>
    </div>
  )
}
