"use client"

import * as React from "react"
import { ChevronUp, Loader2, Terminal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ReadonlyTerminalHandle } from "@/components/ui/readonly-terminal"
import { ReadonlyTerminalView } from "@/components/ui/readonly-terminal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowText,
} from "@/components/design-system/settings-group"
import { cn } from "@/lib/utils"
import { deactivateAgent, listAgents, testAgentStream, updateAgent } from "@/lib/api/agents-client"
import type { Agent, AgentPreset } from "@/lib/api/types"
import { useAppQueue } from "@/contexts/queue-refresh-context"
import { AnthropicIcon, CursorIcon, OpenAIIcon } from "./agent-brand-icons"

const PRESET_CLI: Record<AgentPreset, string> = {
  cursor: "cursor-agent",
  claude_code: "claude",
  codex: "codex",
}

const PRESET_ICON: Record<AgentPreset, React.ComponentType<{ className?: string }>> = {
  cursor: CursorIcon,
  claude_code: AnthropicIcon,
  codex: OpenAIIcon,
}

type LogSegment = {
  id: number
  stream: "stdout" | "stderr"
  meta?: boolean
  text: string
}

function AgentTestTerminal({
  open,
  collapsed,
  onToggleCollapsed,
  title,
  queueLabel,
  activeTab,
  onTabChange,
  running,
  segments,
  onTerminalReady,
  queueCountLabel,
}: {
  open: boolean
  collapsed: boolean
  onToggleCollapsed: () => void
  title: string
  queueLabel: string
  activeTab: "queue" | "terminal"
  onTabChange: (v: "queue" | "terminal") => void
  running: boolean
  segments: LogSegment[]
  onTerminalReady: (h: ReadonlyTerminalHandle | null) => void
  queueCountLabel: string
}) {
  const termRef = React.useRef<ReadonlyTerminalHandle | null>(null)

  React.useEffect(() => {
    if (collapsed) return
    termRef.current?.fit()
  }, [collapsed, running, segments.length])

  React.useEffect(() => {
    onTerminalReady(termRef.current)
    return () => onTerminalReady(null)
  }, [onTerminalReady])

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm",
        "supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div className="flex h-11 w-full items-center gap-3 border-b border-border/80 px-3">
        <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden />

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            if (v === "queue" || v === "terminal") onTabChange(v)
          }}
        >
          <TabsList variant="line" className="h-8 p-0">
            <TabsTrigger value="queue" className="h-8 px-2 text-[12px]">
              {queueLabel}
            </TabsTrigger>
            <TabsTrigger value="terminal" className="h-8 px-2 text-[12px]">
              Terminal
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">
          {activeTab === "terminal" ? (
            <>
              <span className="mx-2 text-muted-foreground/50" aria-hidden>
                |
              </span>
              <span className="truncate">{title}</span>
            </>
          ) : null}
        </div>

        {running ? (
          <Loader2
            className="size-4 shrink-0 animate-spin text-muted-foreground"
            aria-label="Running"
          />
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          <ChevronUp
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              collapsed && "rotate-180"
            )}
            aria-hidden
          />
        </Button>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
      >
        <div className="min-h-0">
          {activeTab === "terminal" ? (
            <ReadonlyTerminalView
              ref={(h) => {
                termRef.current = h
              }}
              className="max-h-[min(40vh,22rem)] overflow-hidden bg-zinc-950 px-2 py-2"
            />
          ) : (
            <div className="max-h-[min(40vh,22rem)] overflow-auto bg-card px-3 py-3 text-[12px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{queueLabel}</span>
                <span className="font-mono text-[11px]">{queueCountLabel}</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Queue details are shown in the app shell status bar; this tab is a quick status view.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentRow({
  agent,
  onToggleEnabled,
  onTest,
  onDeactivate,
  testRunningGlobally,
  thisAgentStreaming,
  canEnable,
}: {
  agent: Agent
  onToggleEnabled: (id: string, enabled: boolean) => void
  onTest: (agent: Agent) => void
  onDeactivate: (agent: Agent) => void
  testRunningGlobally: boolean
  thisAgentStreaming: boolean
  canEnable: boolean
}) {
  const cli = PRESET_CLI[agent.preset]
  const Icon = PRESET_ICON[agent.preset]
  const version = agent.lastTestOk ? (agent.lastTestOutput ?? null) : null
  const displayName = agent.name

  return (
    <SettingsRow className="items-start py-4">
      <SettingsRowText
        title={
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-md border border-border bg-muted/30">
              <Icon className="size-3.5 text-muted-foreground" aria-hidden />
            </span>
            <div>
              <span>{displayName}</span>
              {
                version && (
                <span className="font-mono text-[11px] text-muted-foreground/90">({version})</span>
                )
              }
            </div>
          </div>
        }
        description={
          <p className="font-mono text-[11px] text-muted-foreground/90">CLI: {cli}</p>
        }
        titleClassName="font-medium"
      />
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="default-agent"
              checked={agent.enabled}
              disabled={testRunningGlobally || (!agent.enabled && !canEnable)}
              onChange={(e) => {
                if (e.currentTarget.checked) onToggleEnabled(agent.id, true)
              }}
              className={cn(
                "size-4 shrink-0 rounded-full border border-input bg-background",
                "text-primary accent-primary",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              aria-label={agent.enabled ? "Default agent" : "Set as default agent"}
            />
            <span className="text-[12px] text-muted-foreground">
              {agent.enabled ? "Default" : "Set default"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={testRunningGlobally || agent.lastTestOk}
            onClick={() => onTest(agent)}
            aria-label={agent.lastTestOk ? "Agent activated" : "Activate agent"}
          >
            {thisAgentStreaming ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : agent.lastTestOk ? (
              "Activated"
            ) : (
              "Activate agent"
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={testRunningGlobally || (!agent.lastTestOk && !agent.enabled)}
                  aria-label="Deactivate agent"
                >
                  Deactivate
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate {agent.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will turn it off, clear its saved test status/version, and remove it from any
                  project automation selections.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeactivate(agent)
                  }}
                >
                  Deactivate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </SettingsRow>
  )
}

export function AgentsPanel() {
  const [agents, setAgents] = React.useState<Agent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [terminalOpen, setTerminalOpen] = React.useState(false)
  const [terminalCollapsed, setTerminalCollapsed] = React.useState(false)
  const [terminalTitle, setTerminalTitle] = React.useState("")
  const [terminalRunning, setTerminalRunning] = React.useState(false)
  const [streamingAgentId, setStreamingAgentId] = React.useState<string | null>(null)
  const [segments, setSegments] = React.useState<LogSegment[]>([])
  const [footerTab, setFooterTab] = React.useState<"terminal" | "queue">("terminal")
  const segId = React.useRef(0)
  const termHandleRef = React.useRef<ReadonlyTerminalHandle | null>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const agentsRef = React.useRef<Agent[]>([])
  const appQueue = useAppQueue()
  const waitingCount = appQueue?.queue.waitingCount ?? 0
  const activeSlots = appQueue?.queue.activeSlots ?? 0
  const queueLabel =
    activeSlots > 0 ? `Queue active (${waitingCount})` : `Queue idle (${waitingCount})`
  const queueCountLabel = `${activeSlots} active · ${waitingCount} waiting`

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const r = await listAgents()
    setLoading(false)
    if (!r.ok) {
      toast.error("Could not load agents", { description: r.message })
      setAgents([])
      return
    }
    setAgents(r.agents)
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  React.useEffect(() => {
    agentsRef.current = agents
  }, [agents])

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const onToggleEnabled = React.useCallback(
    (id: string, enabled: boolean) => {
      setAgents((prev) =>
        prev.map((x) => {
          if (!enabled) return x.id === id ? { ...x, enabled: false } : x
          return { ...x, enabled: x.id === id }
        })
      )
      void (async () => {
        const r = await updateAgent(id, { enabled })
        if (!r.ok) {
          toast.error("Could not update agent", { description: r.message })
          void refresh()
          return
        }
        void refresh()
      })()
    },
    [refresh]
  )

  const onDeactivate = React.useCallback(
    (agent: Agent) => {
      void (async () => {
        const r = await deactivateAgent(agent.id)
        if (!r.ok) {
          toast.error("Could not deactivate agent", { description: r.message })
          return
        }
        toast.success("Agent deactivated")
        void refresh()
      })()
    },
    [refresh]
  )

  const runTest = React.useCallback(
    (agent: Agent) => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      segId.current = 0
      setSegments([])
      setTerminalTitle(`Activation output — ${agent.name}`)
      setTerminalOpen(true)
      setTerminalCollapsed(false)
      setTerminalRunning(true)
      setStreamingAgentId(agent.id)
      termHandleRef.current?.clear()

      let raf = 0
      const pending: LogSegment[] = []
      const flush = () => {
        raf = 0
        if (pending.length === 0) return
        const batch = pending.splice(0, pending.length)
        setSegments((prev) => [...prev, ...batch])
      }
      const pushChunk = (text: string, stream: "stdout" | "stderr", meta?: boolean) => {
        pending.push({ id: ++segId.current, stream, meta, text })
        // Terminal-like colors: meta=dim, stderr=amber, stdout=default.
        const prefix = meta
          ? "\u001b[2m"
          : stream === "stderr"
            ? "\u001b[38;5;222m"
            : "\u001b[0m"
        termHandleRef.current?.write(`${prefix}${text}\u001b[0m`)
        if (!raf) {
          raf = requestAnimationFrame(flush)
        }
      }

      void testAgentStream(agent.id, {
        signal: ac.signal,
        onChunk: pushChunk,
        onDone: (r) => {
          if (r.ok) {
            toast.success("Agent activated", { description: r.message })
            // If no default agent exists yet, make the first successfully activated agent the default.
            const hasDefault = agentsRef.current.some((a) => a.enabled)
            if (!hasDefault) {
              onToggleEnabled(agent.id, true)
            }
          } else {
            toast.error("Activation failed", {
              description: r.error,
              richColors: true,
            })
          }
          void refresh()
        },
        onRequestError: (msg) => {
          toast.error("Activation failed", { description: msg, richColors: true })
        },
      }).finally(() => {
        if (raf) {
          cancelAnimationFrame(raf)
        }
        if (pending.length > 0) {
          setSegments((prev) => [...prev, ...pending.splice(0)])
        }
        setTerminalRunning(false)
        setStreamingAgentId(null)
      })
    },
    [onToggleEnabled, refresh]
  )

  return (
    <>
      <div
        className={cn(
          terminalOpen && (terminalCollapsed ? "pb-11" : "pb-[min(40vh,22rem)]")
        )}
      >
        <SettingsGroup>
          {loading ? (
            <SettingsRow>
              <div className="flex items-center gap-2 py-4 text-[13px] text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading agents…
              </div>
            </SettingsRow>
          ) : agents.length === 0 ? (
            <SettingsRow>
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                No agents returned from the API. Restart the server after upgrading.
              </p>
            </SettingsRow>
          ) : (
            agents.map((a) => (
              <AgentRow
                key={a.id}
                agent={a}
                onToggleEnabled={onToggleEnabled}
                onTest={runTest}
                onDeactivate={onDeactivate}
                testRunningGlobally={terminalRunning}
                thisAgentStreaming={streamingAgentId === a.id && terminalRunning}
                canEnable={a.lastTestOk === true}
              />
            ))
          )}
        </SettingsGroup>
      </div>

      <AgentTestTerminal
        open={terminalOpen}
        collapsed={terminalCollapsed}
        onToggleCollapsed={() => setTerminalCollapsed((c) => !c)}
        title={terminalTitle}
        queueLabel={queueLabel}
        queueCountLabel={queueCountLabel}
        activeTab={footerTab}
        onTabChange={setFooterTab}
        running={terminalRunning}
        segments={segments}
        onTerminalReady={(h) => {
          termHandleRef.current = h
        }}
      />
    </>
  )
}
