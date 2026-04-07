"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowText,
} from "@/components/design-system/settings-group"
import { ShellPage } from "@/components/app/shell-page"
import { apiBase } from "@/lib/api/env"
import type { Agent } from "@/lib/api/types"

function AgentRowView({
  agent,
  onToggle,
}: {
  agent: Agent
  onToggle: (id: string, enabled: boolean) => void
}) {
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<string | null>(null)

  return (
    <SettingsRow className="items-start py-4">
      <SettingsRowText
        title={agent.name}
        description={
          <span className="font-mono text-[11px]">{agent.commandPath}</span>
        }
        titleClassName="font-medium"
      />
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{agent.type}</span>
          <Checkbox
            checked={agent.enabled}
            onCheckedChange={(v) => onToggle(agent.id, v === true)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={testing}
          onClick={() => {
            setTesting(true)
            setTestResult(null)
            const b = apiBase()
            if (b) {
              fetch(`${b}/agents/${agent.id}/test`, { method: "POST" })
                .then((r) => r.json())
                .then(
                  (j: { success?: boolean; version?: string; error?: string }) => {
                    setTesting(false)
                    if (j.success) {
                      setTestResult("ok")
                      toast.success("Agent OK", {
                        description: j.version ?? "OK",
                      })
                    } else {
                      setTestResult("err")
                      toast.error("Test failed", {
                        description: j.error ?? "Unknown error",
                      })
                    }
                  }
                )
                .catch(() => {
                  setTesting(false)
                  setTestResult("err")
                  toast.error("Test failed", { description: "Network error" })
                })
              return
            }
            setTesting(false)
            setTestResult("err")
            toast.error("Backend not configured")
          }}
        >
          {testing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : testResult === "ok" ? (
            "✓"
          ) : testResult === "err" ? (
            "✕"
          ) : (
            "Test"
          )}
        </Button>
      </div>
    </SettingsRow>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<Agent[]>([])

  React.useEffect(() => {
    const b = apiBase()
    if (!b) return
    fetch(`${b}/agents`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: Agent[] } | null) => {
        if (j?.data) setAgents(j.data)
      })
      .catch(() => {})
  }, [])

  return (
    <ShellPage maxWidth="standard">
      <p className="mb-6 text-[13px] text-muted-foreground">
        Configured agents for feature runs.
      </p>
      <SettingsGroup>
        {agents.map((a) => (
          <AgentRowView
            key={a.id}
            agent={a}
            onToggle={(id, enabled) => {
              setAgents((prev) =>
                prev.map((x) => (x.id === id ? { ...x, enabled } : x))
              )
              const b = apiBase()
              if (b) {
                void fetch(`${b}/agents/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ enabled }),
                })
              }
            }}
          />
        ))}
      </SettingsGroup>
    </ShellPage>
  )
}
