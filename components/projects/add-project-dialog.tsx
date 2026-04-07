"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiBase } from "@/lib/api/env"

export function AddProjectDialog() {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<"local" | "git">("local")
  const [localPath, setLocalPath] = React.useState("")
  const [localName, setLocalName] = React.useState("")
  const [gitUrl, setGitUrl] = React.useState("")
  const [clonePath, setClonePath] = React.useState("")
  const [gitName, setGitName] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Add project</DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>
            Local folder or Git clone.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "local" | "git")}
          className="gap-3"
        >
          <TabsList className="w-full">
            <TabsTrigger value="local" className="flex-1">
              Local folder
            </TabsTrigger>
            <TabsTrigger value="git" className="flex-1">
              Git repository
            </TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled>
                Browse folder
              </Button>
              <span className="self-center text-[11px] text-muted-foreground">
                or paste path
              </span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="local-path">Path</Label>
              <Input
                id="local-path"
                placeholder="/Users/you/project"
                className="font-mono text-xs"
                value={localPath}
                onChange={(e) => {
                  const v = e.target.value
                  setLocalPath(v)
                  if (!localName.trim()) {
                    const parts = v.replace(/\/+$/, "").split("/")
                    setLocalName(parts[parts.length - 1] ?? "")
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="local-name">Name</Label>
              <Input
                id="local-name"
                placeholder="Auto-filled from folder"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="git" className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="git-url">Git URL</Label>
              <Input
                id="git-url"
                placeholder="https://github.com/org/repo.git"
                className="font-mono text-xs"
                value={gitUrl}
                onChange={(e) => {
                  const v = e.target.value
                  setGitUrl(v)
                  if (!gitName.trim()) {
                    const base = v.replace(/\/+$/, "").split("/").pop() ?? ""
                    setGitName(base.replace(/\.git$/, ""))
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="git-clone-path">Local clone path</Label>
              <Input
                id="git-clone-path"
                placeholder="/Users/you/projects/repo"
                className="font-mono text-xs"
                value={clonePath}
                onChange={(e) => setClonePath(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="git-name">Name</Label>
              <Input
                id="git-name"
                placeholder="Auto-filled from repo URL"
                value={gitName}
                onChange={(e) => setGitName(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => {
              void (async () => {
                const b = apiBase()
                if (!b) {
                  toast.error("Backend not configured", {
                    description: "Set NEXT_PUBLIC_API_BASE to your server URL.",
                  })
                  return
                }
                setSaving(true)
                try {
                  const payload =
                    tab === "git"
                      ? {
                          type: "git" as const,
                          gitUrl,
                          clonePath,
                          name: gitName || undefined,
                        }
                      : {
                          type: "local" as const,
                          localPath,
                          name: localName || undefined,
                        }
                  const r = await fetch(`${b}/projects`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  })
                  const j = (await r.json().catch(() => null)) as
                    | { data?: unknown; error?: { message?: string } }
                    | null
                  if (!r.ok) {
                    toast.error("Could not add project", {
                      description: j?.error?.message ?? r.statusText,
                    })
                    return
                  }
                  toast.success("Project added")
                  setOpen(false)
                  // Let the server component page refetch
                  window.location.reload()
                } catch {
                  toast.error("Could not add project", { description: "Network error" })
                } finally {
                  setSaving(false)
                }
              })()
            }}
          >
            {tab === "git" ? "Clone & add" : "Add project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
