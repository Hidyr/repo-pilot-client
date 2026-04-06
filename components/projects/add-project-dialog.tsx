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

export function AddProjectDialog() {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<"local" | "git">("local")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Add project</DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>
            Local folder or Git clone — demo only, no filesystem access.
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
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="local-name">Name</Label>
              <Input id="local-name" placeholder="Auto-filled from folder" />
            </div>
          </TabsContent>
          <TabsContent value="git" className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="git-url">Git URL</Label>
              <Input
                id="git-url"
                placeholder="https://github.com/org/repo.git"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="git-clone-path">Local clone path</Label>
              <Input
                id="git-clone-path"
                placeholder="/Users/you/projects/repo"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="git-name">Name</Label>
              <Input id="git-name" placeholder="Auto-filled from repo URL" />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              toast.message("Add project (demo)")
              setOpen(false)
            }}
          >
            {tab === "git" ? "Clone & add" : "Add project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
