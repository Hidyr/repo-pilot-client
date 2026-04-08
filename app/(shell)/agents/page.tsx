import { AgentsPanel } from "@/components/agents/agents-panel"
import { ShellPage } from "@/components/app/shell-page"

export default function AgentsPage() {
  return (
    <ShellPage maxWidth="standard">
      <AgentsPanel />
    </ShellPage>
  )
}
