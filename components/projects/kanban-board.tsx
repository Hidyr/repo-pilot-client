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
import { Clock, X } from "lucide-react"
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
import { apiBase } from "@/lib/api/env"
import { postFeaturesReorder, putFeature } from "@/lib/api/feature-client"
import { useQueueRefresh } from "@/contexts/queue-refresh-context"
import type { Feature, FeatureStatus } from "@/lib/api/types"

async function persistBoardState(
  projectId: string | undefined,
  prev: Record<string, Feature>,
  nextMap: Record<string, Feature>,
  cols: Record<ColumnId, string[]>,
  refreshQueue: (() => Promise<void>) | null,
  applyServerFeatures?: (list: Feature[]) => void
) {
  if (!projectId || !apiBase()) return
  const serverPatches: Feature[] = []
  for (const id of Object.keys(nextMap)) {
    if (prev[id]?.status !== nextMap[id]?.status) {
      const updated = await putFeature(id, { status: nextMap[id]!.status })
      if (updated) serverPatches.push(updated)
    }
  }
  const orderedIds = [...cols.pending, ...cols.active, ...cols.done]
  try {
    await postFeaturesReorder(projectId, orderedIds)
  } catch {
    /* reorder may fail; board stream will reconcile */
  }
  if (serverPatches.length) applyServerFeatures?.(serverPatches)
  await refreshQueue?.()
}

const COLUMN_IDS = ["pending", "active", "done"] as const
type ColumnId = (typeof COLUMN_IDS)[number]

function columnsFromFeatures(features: Feature[]): Record<ColumnId, string[]> {
  return {
    pending: features
      .filter((f) => ["pending", "failed"].includes(f.status))
      .map((f) => f.id),
    active: features
      .filter((f) => f.status === "in_progress" || f.status === "queued")
      .map((f) => f.id),
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
  if (id === "pending" || id === "active" || id === "done") {
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
  children,
}: {
  columnId: ColumnId
  title: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  })
  return (
    <div className="flex min-h-[280px] min-w-0 flex-1 flex-col rounded-lg border border-border bg-muted/20">
      <div className="border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
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
  const failed = feature.status === "failed"

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
        failed && "border-destructive/40"
      )}
    >
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
      {failed ? (
        <div className="mb-2 text-[10px] text-destructive">Failed — click to retry</div>
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
      if (overIdStr === "pending" || overIdStr === "active" || overIdStr === "done") {
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
    void persistBoardState(projectId, prevMap, nextMap, next, refreshQueue, (patches) => {
      setFeaturesById((cur) => {
        const merged = { ...cur }
        for (const f of patches) merged[f.id] = f
        return merged
      })
    })
  }

  const activeFeature = activeId ? featuresById[activeId] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        {(Object.entries({ pending: "Pending", active: "In progress", done: "Done" }) as [
          ColumnId,
          string,
       ][]).map(([columnId, title]) => (
          <FeatureColumn key={columnId} columnId={columnId} title={title}>
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
