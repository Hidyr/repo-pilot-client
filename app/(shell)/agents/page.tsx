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
import { DUMMY_AGENTS, type AgentRow } from "@/lib/dummy-data"

function AgentRowView({
  agent,
  onToggle,
}: {
  agent: AgentRow
  onToggle: (id: string, enabled: boolean) => void
}) {
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<string | null>(null)

  return (
    <SettingsRow className="items-start py-4">
      <SettingsRowText
        title={agent.name}
        description={
          <span className="font-mono text-[11px]">{agent.command}</span>
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
            window.setTimeout(() => {
              setTesting(false)
              const ok = Math.random() > 0.2
              if (ok) {
                setTestResult("ok")
                toast.success("Agent OK", { description: "cursor-agent 1.2.3 (demo)" })
              } else {
                setTestResult("err")
                toast.error("Test failed", { description: "Connection refused (demo)" })
              }
            }, 900)
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
  const [agents, setAgents] = React.useState(DUMMY_AGENTS)

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-6 text-[13px] text-muted-foreground">
        Configured agents for feature runs. Test calls are simulated.
      </p>
      <SettingsGroup>
        {agents.map((a) => (
          <AgentRowView
            key={a.id}
            agent={a}
            onToggle={(id, enabled) =>
              setAgents((prev) =>
                prev.map((x) => (x.id === id ? { ...x, enabled } : x))
              )
            }
          />
        ))}
      </SettingsGroup>
    </div>
  )
}
