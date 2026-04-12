"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
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
import { pickFolder } from "@/lib/os/pick-folder"
import { cn } from "@/lib/utils"

export function AddProjectDialog() {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<"local" | "git">("local")
  const [localPath, setLocalPath] = React.useState("")
  const [localName, setLocalName] = React.useState("")
  const [gitUrl, setGitUrl] = React.useState("")
  const [clonePath, setClonePath] = React.useState("")
  const [gitName, setGitName] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const saveAbortRef = React.useRef<AbortController | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && saving) return
        setOpen(next)
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>Add project</DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg" showCloseButton={!saving}>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>
            Local folder or Git clone.
          </DialogDescription>
        </DialogHeader>
        <div className="relative min-h-[220px]">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            if (!saving) setTab(v as "local" | "git")
          }}
          className={cn("gap-3", saving && "pointer-events-none opacity-50")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="local" className="flex-1" disabled={saving}>
              Local folder
            </TabsTrigger>
            <TabsTrigger value="git" className="flex-1" disabled={saving}>
              Git repository
            </TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="local-path">Path</Label>
              <div className="flex gap-2">
                <Input
                  id="local-path"
                  placeholder="/Users/you/project"
                  className="font-mono text-xs"
                  disabled={saving}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    void (async () => {
                      const selected = await pickFolder()
                      if (!selected) return
                      setLocalPath(selected)
                      const parts = selected.replace(/\/+$/, "").split("/")
                      setLocalName(parts[parts.length - 1] ?? "")
                    })()
                  }}
                >
                  Browse
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="local-name">Name</Label>
              <Input
                id="local-name"
                placeholder="Auto-filled from folder"
                disabled={saving}
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
                disabled={saving}
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
              <Label htmlFor="git-clone-path">Clone into folder</Label>
              <div className="flex gap-2">
                <Input
                  id="git-clone-path"
                  placeholder="(optional) Parent folder; repo is cloned as a subfolder"
                  className="font-mono text-xs"
                  disabled={saving}
                  value={clonePath}
                  onChange={(e) => setClonePath(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    void (async () => {
                      const selected = await pickFolder()
                      if (!selected) return
                      setClonePath(selected)
                    })()
                  }}
                >
                  Browse
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Browse picks a parent directory; the remote is cloned into{" "}
                <span className="font-mono">&lt;that-folder&gt;/&lt;repo-name&gt;</span>. Leave blank
                to use your default clone folder (Settings).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="git-name">Name</Label>
              <Input
                id="git-name"
                placeholder="Auto-filled from repo URL"
                disabled={saving}
                value={gitName}
                onChange={(e) => setGitName(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        {saving ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-popover/95 px-6 text-center ring-1 ring-foreground/10 backdrop-blur-sm"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {tab === "git" ? "Cloning repository…" : "Adding project…"}
              </p>
              <p className="text-xs text-muted-foreground">
                {tab === "git"
                  ? "Large repositories can take several minutes. You can stop waiting below; the server may still finish cloning in the background."
                  : "Validating path and saving to RepoPilot."}
              </p>
            </div>
          </div>
        ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (saving) {
                saveAbortRef.current?.abort()
                return
              }
              setOpen(false)
            }}
          >
            {saving ? "Run in background" : "Cancel"}
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
                const ac = new AbortController()
                saveAbortRef.current = ac
                setSaving(true)
                try {
                  const payload =
                    tab === "git"
                      ? {
                          type: "git" as const,
                          gitUrl,
                          ...(clonePath.trim() ? { clonePath: clonePath.trim() } : {}),
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
                    signal: ac.signal,
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
                } catch (e: unknown) {
                  const aborted =
                    (e instanceof DOMException && e.name === "AbortError") ||
                    (e instanceof Error && e.name === "AbortError")
                  if (aborted) {
                    toast.message("Stopped waiting for the server")
                    return
                  }
                  toast.error("Could not add project", { description: "Network error" })
                } finally {
                  setSaving(false)
                  saveAbortRef.current = null
                }
              })()
            }}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {tab === "git" ? "Cloning…" : "Adding…"}
              </>
            ) : tab === "git" ? (
              "Add Repo"
            ) : (
              "Add project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
