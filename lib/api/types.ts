export type FeatureStatus = "pending" | "queued" | "in_progress" | "review" | "done" | "failed"

export type Project = {
  id: string
  name: string
  description: string | null
  localPath: string
  isGitRepo: boolean
  remoteUrl: string | null
  remoteName: string | null
  defaultBranch: string | null
  createdAt: string
  updatedAt: string
  pendingCount: number
  doneCount: number
  lastRun: Run | null
  hasActiveRun: boolean
}

export type Feature = {
  id: string
  projectId: string
  title: string
  description: string | null
  userPrompt: string | null
  status: FeatureStatus
  /** When true, automation and queue runs skip this feature until unfrozen. */
  frozen: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type RunStatus = "queued" | "running" | "success" | "failed" | "skipped"

export type Run = {
  id: string
  projectId: string
  featureId: string | null
  agentId: string | null
  status: RunStatus
  logs: string | null
  errorMessage: string | null
  startedAt: string
  completedAt: string | null
  commitHash: string | null
  pushedAt: string | null
  mergedAt: string | null
  queuePosition: number | null
}

export type QueueJob = {
  id: string
  projectId: string
  projectName: string
  featureId: string
  runId: string | null
  featureTitle: string
  status: "waiting" | "active"
  priority: number
  createdAt: string
  startedAt?: string
}

export type QueueSnapshot = {
  maxSlots: number
  activeSlots: number
  waitingCount: number
  jobs: QueueJob[]
}

export type GitRunStartMode = "current" | "from_base" | "branch"

export type Schedule = {
  enabled: boolean
  agentId?: string | null
  intervalType: "fixed" | "random"
  runsPerDay: number
  featuresPerRun: number
  executionTimes?: string[]
  gitAutoPull: boolean
  gitAutoCommit: boolean
  gitAutoPush: boolean
  gitAutoMerge: boolean
  gitRunStartMode: GitRunStartMode
  gitRunBranch: string | null
}

export type AgentPreset = "cursor" | "claude_code" | "codex"

export type Agent = {
  id: string
  name: string
  preset: AgentPreset
  enabled: boolean
  lastTestOk: boolean
  lastTestedAt: string | null
  lastTestOutput: string | null
  createdAt: string
  updatedAt: string
}

export type Settings = {
  theme: "dark" | "light"
  autostart: string
  max_concurrent_runs: string
  minimize_to_tray: string
  max_concurrent_runs_editable: string
  max_concurrent_runs_lock_reason: string
}
