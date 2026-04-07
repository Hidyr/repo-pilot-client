/** Static demo data for RepoPilot UI (prompt.md §6). Replace with API calls later. */

export type Project = {
  id: string
  name: string
  description: string
  localPath: string
  remoteUrl: string | null
  branch: string | null
  isGitRepo: boolean
  defaultBranch: string
  pendingCount: number
  doneCount: number
  lastRunAt: string | null
  hasActiveRun: boolean
  readmeExcerpt: string
}

export const DUMMY_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "my-app",
    description: "Main product app — React + Next.js",
    localPath: "/Users/dev/projects/my-app",
    remoteUrl: "https://github.com/acme/my-app",
    branch: "main",
    isGitRepo: true,
    defaultBranch: "main",
    pendingCount: 4,
    doneCount: 12,
    lastRunAt: "2026-04-05T18:22:00Z",
    hasActiveRun: true,
    readmeExcerpt: `# my-app\n\nFeature automation via RepoPilot.\n\n## Scripts\n- \`pnpm dev\` — start dev server`,
  },
  {
    id: "proj-2",
    name: "shop",
    description: "Checkout and catalog experiments",
    localPath: "/Users/dev/projects/shop",
    remoteUrl: "https://github.com/acme/shop",
    branch: "develop",
    isGitRepo: true,
    defaultBranch: "main",
    pendingCount: 2,
    doneCount: 8,
    lastRunAt: "2026-04-04T09:10:00Z",
    hasActiveRun: false,
    readmeExcerpt: `# Shop\n\nE-commerce UI prototypes.`,
  },
  {
    id: "proj-3",
    name: "notes-local",
    description: "Personal notes folder (no Git)",
    localPath: "/Users/dev/Documents/notes-local",
    remoteUrl: null,
    branch: null,
    isGitRepo: false,
    defaultBranch: "main",
    pendingCount: 1,
    doneCount: 0,
    lastRunAt: null,
    hasActiveRun: false,
    readmeExcerpt: `# Notes\n\nLocal markdown only.`,
  },
]

export function getProject(id: string): Project | undefined {
  return DUMMY_PROJECTS.find((p) => p.id === id)
}

export type QueueJobState = "active" | "waiting"

export type QueueJob = {
  id: string
  projectName: string
  featureTitle: string
  state: QueueJobState
  /** Present when data comes from GET /api/queue */
  featureId?: string
}

export type QueueSnapshot = {
  maxSlots: number
  activeCount: number
  waitingCount: number
  jobs: QueueJob[]
}

export const DUMMY_QUEUE: QueueSnapshot = {
  maxSlots: 4,
  activeCount: 2,
  waitingCount: 3,
  jobs: [
    {
      id: "job-1",
      projectName: "my-app",
      featureTitle: "Add dark mode",
      state: "active",
    },
    {
      id: "job-2",
      projectName: "blog",
      featureTitle: "Fix nav",
      state: "active",
    },
    {
      id: "job-3",
      projectName: "shop",
      featureTitle: "Checkout flow",
      state: "waiting",
    },
    {
      id: "job-4",
      projectName: "dashboard",
      featureTitle: "Charts widget",
      state: "waiting",
    },
    {
      id: "job-5",
      projectName: "api",
      featureTitle: "Auth middleware",
      state: "waiting",
    },
  ],
}

export function queueBadgeCount(q: QueueSnapshot): number {
  return q.activeCount + q.waitingCount
}

export type FeatureStatus =
  | "pending"
  | "queued"
  | "in_progress"
  | "done"
  | "failed"

export type FeatureCard = {
  id: string
  projectId: string
  title: string
  description: string
  status: FeatureStatus
  /** Extra instructions merged into the agent prompt (user-editable). */
  userPrompt?: string
}

export const DUMMY_FEATURES: FeatureCard[] = [
  {
    id: "f-1",
    projectId: "proj-1",
    title: "Dark mode toggle",
    description: "Add system preference detection",
    status: "queued",
  },
  {
    id: "f-2",
    projectId: "proj-1",
    title: "OAuth callback URL",
    description: "Fix redirect on production",
    status: "in_progress",
  },
  {
    id: "f-3",
    projectId: "proj-1",
    title: "Empty state illustrations",
    description: "Onboarding screens",
    status: "pending",
  },
  {
    id: "f-4",
    projectId: "proj-1",
    title: "API error codes",
    description: "Normalize JSON errors",
    status: "failed",
  },
  {
    id: "f-5",
    projectId: "proj-1",
    title: "Footer links",
    description: "Legal pages",
    status: "done",
  },
  {
    id: "f-6",
    projectId: "proj-1",
    title: "Search debounce",
    description: "Performance",
    status: "pending",
  },
]

export function featuresForProject(projectId: string): FeatureCard[] {
  return DUMMY_FEATURES.filter((f) => f.projectId === projectId)
}

export type RunRow = {
  id: string
  projectId: string
  featureId?: string
  status: "running" | "success" | "failed" | "skipped"
  featureTitle: string
  startedAt: string
  durationSec: number
  commit: string | null
  pushed: boolean
  merged: boolean
  logLines: string[]
}

export const DUMMY_RUNS: RunRow[] = [
  {
    id: "run-1",
    projectId: "proj-1",
    status: "success",
    featureTitle: "Checkout flow",
    startedAt: "2026-04-05T18:15:00Z",
    durationSec: 134,
    commit: "a1b2c3d",
    pushed: true,
    merged: true,
    logLines: [
      "[GIT] Pulling latest changes…",
      "[GIT] Pull complete.",
      "[AGENT] Starting…",
      "[AGENT] Completed successfully.",
      "[GIT] Committed: a1b2c3d",
    ],
  },
  {
    id: "run-2",
    projectId: "proj-1",
    status: "failed",
    featureTitle: "Charts widget",
    startedAt: "2026-04-05T17:40:00Z",
    durationSec: 45,
    commit: null,
    pushed: false,
    merged: false,
    logLines: [
      "[GIT] Pulling latest changes…",
      "[AGENT] Starting…",
      "[ERROR] Command timed out",
    ],
  },
  {
    id: "run-3",
    projectId: "proj-1",
    status: "skipped",
    featureTitle: "No features available",
    startedAt: "2026-04-05T12:00:00Z",
    durationSec: 0,
    commit: null,
    pushed: false,
    merged: false,
    logLines: ["[AGENT] No pending features — skipped."],
  },
]

export function runsForProject(projectId: string): RunRow[] {
  return DUMMY_RUNS.filter((r) => r.projectId === projectId)
}

export type AgentRow = {
  id: string
  name: string
  type: "cli" | "stdio"
  command: string
  enabled: boolean
}

export const DUMMY_AGENTS: AgentRow[] = [
  {
    id: "ag-1",
    name: "Cursor Agent",
    type: "stdio",
    command: "/usr/local/bin/cursor-agent",
    enabled: true,
  },
  {
    id: "ag-2",
    name: "Claude Code",
    type: "cli",
    command: "npx @anthropic-ai/claude-code",
    enabled: true,
  },
]
