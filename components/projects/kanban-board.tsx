"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Clock, Plus, Snowflake, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiBase } from "@/lib/api/env"
import { postFeature, postFeaturesReorder, putFeature } from "@/lib/api/feature-client"
import { useQueueRefresh } from "@/contexts/queue-refresh-context"
import type { Feature, FeatureStatus } from "@/lib/api/types"

async function persistBoardState(
  projectId: string | undefined,
  prev: Record<string, Feature>,
  nextMap: Record<string, Feature>,
  cols: Record<ColumnId, string[]>,
  refreshQueue: (() => Promise<void>) | null,
  applyServerFeatures?: (list: Feature[]) => void,
  onPersistError?: (err: unknown) => void
) {
  if (!projectId || !apiBase()) return
  const serverPatches: Feature[] = []
  try {
    for (const id of Object.keys(nextMap)) {
      if (prev[id]?.status !== nextMap[id]?.status) {
        const updated = await putFeature(id, { status: nextMap[id]!.status })
        if (updated) serverPatches.push(updated)
      }
    }
    const orderedIds = [...cols.pending, ...cols.active, ...cols.review, ...cols.done]
    try {
      await postFeaturesReorder(projectId, orderedIds)
    } catch {
      /* reorder may fail; board stream will reconcile */
    }
    if (serverPatches.length) applyServerFeatures?.(serverPatches)
    await refreshQueue?.()
  } catch (e) {
    onPersistError?.(e)
  }
}

const COLUMN_IDS = ["pending", "active", "review", "done"] as const
type ColumnId = (typeof COLUMN_IDS)[number]

function columnsFromFeatures(features: Feature[]): Record<ColumnId, string[]> {
  return {
    pending: features
      .filter((f) => ["pending", "failed"].includes(f.status))
      .map((f) => f.id),
    active: features
      .filter((f) => f.status === "in_progress" || f.status === "queued")
      .map((f) => f.id),
    review: features.filter((f) => f.status === "review").map((f) => f.id),
    done: features.filter((f) => f.status === "done").map((f) => f.id),
  }
}

function featureMapFromList(features: Feature[]): Record<string, Feature> {
  return Object.fromEntries(features.map((f) => [f.id, f]))
}

function findContainer(
  columns: Record<ColumnId, string[]>,
  id: string
): ColumnId | undefined {
  if (id === "pending" || id === "active" || id === "review" || id === "done") {
    return id
  }
  for (const col of COLUMN_IDS) {
    if (columns[col].includes(id)) return col
  }
  return undefined
}

function mergeStatusFromColumns(
  cols: Record<ColumnId, string[]>,
  prev: Record<string, Feature>
): Record<string, Feature> {
  const next: Record<string, Feature> = { ...prev }
  for (const id of cols.pending) {
    const f = next[id]
    if (!f) continue
    if (f.status === "failed") next[id] = { ...f, status: "failed" as FeatureStatus }
    else next[id] = { ...f, status: "pending" as FeatureStatus }
  }
  for (const id of cols.active) {
    const f = next[id]
    if (!f) continue
    if (f.status === "queued") {
      next[id] = { ...f, status: "queued" as FeatureStatus }
    } else {
      next[id] = { ...f, status: "in_progress" as FeatureStatus }
    }
  }
  for (const id of cols.review) {
    const f = next[id]
    if (!f) continue
    next[id] = { ...f, status: "review" as FeatureStatus }
  }
  for (const id of cols.done) {
    const f = next[id]
    if (!f) continue
    next[id] = { ...f, status: "done" as FeatureStatus }
  }
  return next
}

function FeatureColumn({
  columnId,
  title,
  headerRight,
  children,
}: {
  columnId: ColumnId
  title: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  })
  return (
    <div className="flex min-h-[280px] min-w-0 flex-1 flex-col rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[200px] flex-1 flex-col gap-2 p-2",
          isOver && "rounded-md bg-muted/40 ring-1 ring-inset ring-border"
        )}
      >
        {children}
      </div>
    </div>
  )
}

function KanbanCard({ feature, projectId }: { feature: Feature; projectId?: string }) {
  const queued = feature.status === "queued"
  const running = feature.status === "in_progress"
  const inReview = feature.status === "review"
  const failed = feature.status === "failed"
  const frozen = feature.frozen

  const body =
    projectId != null && projectId !== "" ? (
      <Link
        href={`/projects/${projectId}/features/${feature.id}`}
        className="block rounded-sm outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <p className="font-medium text-foreground">{feature.title}</p>
        <p className="mt-1 line-clamp-2 text-muted-foreground">{feature.description}</p>
      </Link>
    ) : (
      <>
        <p className="font-medium text-foreground">{feature.title}</p>
        <p className="mt-1 line-clamp-2 text-muted-foreground">{feature.description}</p>
      </>
    )

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-xs shadow-sm",
        failed && "border-destructive/40",
        frozen && "border-sky-500/35 bg-muted/30"
      )}
    >
      {frozen ? (
        <div className="mb-2 flex items-center gap-1.5">
          <Snowflake className="size-3 text-sky-400/90" aria-hidden />
          <span className="text-[10px] font-medium text-sky-300/90">Frozen</span>
        </div>
      ) : null}
      {queued ? (
        <div className="mb-2 flex items-center gap-1.5">
          <Clock className="size-3 text-muted-foreground" />
          <StatusBadge status="queued" className="text-[10px]">
            Waiting in queue
          </StatusBadge>
        </div>
      ) : null}
      {running ? (
        <div className="mb-2 flex items-center gap-1.5">
          <StatusBadge status="in_progress" className="text-[10px]">
            Agent running…
          </StatusBadge>
        </div>
      ) : null}
      {inReview ? (
        <div className="mb-2 flex items-center gap-1.5">
          <StatusBadge status="review" className="text-[10px]">
            Ready for your review
          </StatusBadge>
        </div>
      ) : null}
      {failed ? (
        <div className="mb-2 text-[10px] text-destructive">Failed</div>
      ) : null}
      {body}
    </div>
  )
}

function SortableKanbanCard({
  feature,
  projectId: cardProjectId,
  onCancelRun,
}: {
  feature: Feature
  projectId?: string
  onCancelRun?: (feature: Feature) => void | Promise<void>
}) {
  // Allow moving `queued` (waiting) cards back/forth; only lock active agent runs.
  const locked = feature.status === "in_progress"
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
    disabled: locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  const showCancel =
    feature.status === "in_progress" && onCancelRun != null && !isDragging

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <div className="relative">
        {showCancel ? (
          <div
            className="absolute top-1 right-1 z-20"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Cancel run"
                  />
                }
              >
                <X className="size-3.5" strokeWidth={2} />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this run?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Stops the active job and moves this card back to Pending.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void onCancelRun(feature)
                    }}
                  >
                    Cancel run
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
        <div
          {...(locked ? {} : { ...attributes, ...listeners })}
          className={cn(locked ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
        >
          <KanbanCard feature={feature} projectId={cardProjectId} />
        </div>
      </div>
    </div>
  )
}

export function KanbanBoard({
  features,
  projectId,
}: {
  features: Feature[]
  /** When set and API is configured, drag/drop persists to the server */
  projectId?: string
}) {
  const router = useRouter()
  const refreshQueue = useQueueRefresh()

  const cancelFeatureRun = useCallback(
    async (feature: Feature) => {
      const b = apiBase()
      if (!b) {
        toast.message("API not configured")
        return
      }
      try {
        const r = await fetch(`${b}/queue`)
        if (!r.ok) {
          toast.error("Could not load queue")
          return
        }
        const j = (await r.json()) as {
          data: {
            jobs: Array<{ id: string; featureId: string; projectId?: string }>
          }
        }
        const job = j.data.jobs.find(
          (x) =>
            x.featureId === feature.id &&
            (!projectId || !x.projectId || x.projectId === projectId)
        )
        if (!job) {
          toast.error("No queue job found for this card")
          return
        }
        const del = await fetch(`${b}/queue/${job.id}`, { method: "DELETE" })
        if (!del.ok) {
          toast.error("Could not cancel run")
          return
        }
        await refreshQueue?.()
        router.refresh()
        toast.message("Run cancelled")
      } catch {
        toast.error("Could not cancel run")
      }
    },
    [projectId, refreshQueue, router]
  )

  const [columns, setColumns] = useState<Record<ColumnId, string[]>>(() =>
    columnsFromFeatures(features)
  )
  const [featuresById, setFeaturesById] = useState<Record<string, Feature>>(() =>
    featureMapFromList(features)
  )
  const [activeId, setActiveId] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newPrompt, setNewPrompt] = useState("")

  const canCreate = Boolean(projectId && apiBase())

  useEffect(() => {
    setColumns(columnsFromFeatures(features))
    setFeaturesById(featureMapFromList(features))
  }, [features])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)
    if (activeIdStr === overIdStr) return

    setColumns((items) => {
      const activeCol = findContainer(items, activeIdStr)
      const overCol = findContainer(items, overIdStr)
      if (!activeCol || !overCol || activeCol === overCol) return items

      const activeItems = items[activeCol]
      const overItems = items[overCol]
      const activeIndex = activeItems.indexOf(activeIdStr)
      if (activeIndex === -1) return items

      const overIndex = overItems.indexOf(overIdStr)
      let newIndex: number
      if (
        overIdStr === "pending" ||
        overIdStr === "active" ||
        overIdStr === "review" ||
        overIdStr === "done"
      ) {
        newIndex = overItems.length
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length
      }

      const moved = activeItems[activeIndex]
      return {
        ...items,
        [activeCol]: activeItems.filter((id) => id !== moved),
        [overCol]: [...overItems.slice(0, newIndex), moved, ...overItems.slice(newIndex)],
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    // IMPORTANT: keep React state updaters pure. Calling async persistence inside a
    // setState updater can run multiple times in Strict Mode (double-invoked),
    // causing duplicate reorder/queue requests.
    const current = columns
    let next = current

    if (over) {
      const activeIdStr = String(active.id)
      const overIdStr = String(over.id)
      const activeCol = findContainer(current, activeIdStr)
      const overCol = findContainer(current, overIdStr)

      if (activeCol && overCol && activeCol === overCol) {
        const oldIndex = current[activeCol].indexOf(activeIdStr)
        const newIndex = current[overCol].indexOf(overIdStr)
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          next = {
            ...current,
            [activeCol]: arrayMove(current[activeCol], oldIndex, newIndex),
          }
        }
      }
    }

    const prevMap = featuresById
    const nextMap = mergeStatusFromColumns(next, prevMap)

    setColumns(next)
    setFeaturesById(nextMap)

    // Persist once per completed drop.
    void persistBoardState(
      projectId,
      prevMap,
      nextMap,
      next,
      refreshQueue,
      (patches) => {
        setFeaturesById((cur) => {
          const merged = { ...cur }
          for (const f of patches) merged[f.id] = f
          return merged
        })
      },
      (err) => {
        toast.error((err as Error)?.message ?? "Could not save board")
        router.refresh()
      }
    )
  }

  const activeFeature = activeId ? featuresById[activeId] : null

  const addFeature = useCallback(async () => {
    if (!projectId) return
    const title = newTitle.trim()
    if (!title) return
    setAdding(true)
    try {
      const created = await postFeature({
        projectId,
        title,
        description: newDescription.trim() ? newDescription.trim() : undefined,
        userPrompt: newPrompt.trim() ? newPrompt.trim() : undefined,
      })
      if (!created) throw new Error("Could not create feature")
      setNewTitle("")
      setNewDescription("")
      setNewPrompt("")
      setAddOpen(false)
      setFeaturesById((cur) => {
        if (cur[created.id]) return cur
        return { ...cur, [created.id]: created }
      })
      setColumns((cur) => {
        if (cur.pending.includes(created.id)) return cur
        return { ...cur, pending: [...cur.pending, created.id] }
      })
      toast.success("Feature added")
    } catch (e) {
      toast.error("Could not add feature", { description: (e as Error)?.message ?? "Error" })
    } finally {
      setAdding(false)
    }
  }, [newTitle, newDescription, newPrompt, projectId])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        {(Object.entries({
          pending: "Pending",
          active: "In progress",
          review: "Review",
          done: "Done",
        }) as [ColumnId, string][]).map(([columnId, title]) => (
          <FeatureColumn
            key={columnId}
            columnId={columnId}
            title={title}
            headerRight={
              columnId === "pending" ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!canCreate}
                    onClick={() => setAddOpen(true)}
                  >
                    <Plus className="size-3" />
                    Add feature
                  </Button>
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogContent className="sm:max-w-lg" showCloseButton>
                      <DialogHeader>
                        <DialogTitle>Add feature</DialogTitle>
                        <DialogDescription>
                          Create a new feature in the Pending column.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="new-feature-title">Title</Label>
                          <Input
                            id="new-feature-title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Short, specific title"
                            disabled={adding}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                void addFeature()
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="new-feature-desc">Description</Label>
                          <Textarea
                            id="new-feature-desc"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Optional. What should this do?"
                            disabled={adding}
                            className="min-h-24"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="new-feature-prompt">Agent prompt</Label>
                          <Textarea
                            id="new-feature-prompt"
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            placeholder="Optional. Exact instructions for the agent."
                            disabled={adding}
                            className="min-h-28 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={adding}
                          onClick={() => setAddOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          disabled={adding || !newTitle.trim()}
                          onClick={() => void addFeature()}
                        >
                          {adding ? "Adding…" : "Add feature"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : null
            }
          >
            <SortableContext
              items={columns[columnId]}
              strategy={verticalListSortingStrategy}
            >
              {columns[columnId].map((id) => {
                const f = featuresById[id]
                if (!f) return null
                return (
                  <SortableKanbanCard
                    key={id}
                    feature={f}
                    projectId={projectId}
                    onCancelRun={
                      projectId && apiBase() ? cancelFeatureRun : undefined
                    }
                  />
                )
              })}
            </SortableContext>
          </FeatureColumn>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeFeature ? (
          <div className="cursor-grabbing opacity-90 shadow-lg">
            <KanbanCard feature={activeFeature} projectId={projectId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
