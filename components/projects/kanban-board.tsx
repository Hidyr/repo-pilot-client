"use client"

import { useEffect, useState } from "react"
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
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
import type { FeatureCard as Feature, FeatureStatus } from "@/lib/dummy-data"

const COLUMN_IDS = ["pending", "active", "done"] as const
type ColumnId = (typeof COLUMN_IDS)[number]

function columnsFromFeatures(features: Feature[]): Record<ColumnId, string[]> {
  return {
    pending: features
      .filter((f) => ["pending", "queued", "failed"].includes(f.status))
      .map((f) => f.id),
    active: features.filter((f) => f.status === "in_progress").map((f) => f.id),
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
    if (!f || f.status === "queued") continue
    if (f.status === "failed") next[id] = { ...f, status: "failed" as FeatureStatus }
    else next[id] = { ...f, status: "pending" as FeatureStatus }
  }
  for (const id of cols.active) {
    const f = next[id]
    if (!f) continue
    next[id] = { ...f, status: "in_progress" as FeatureStatus }
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

function KanbanCard({ feature }: { feature: Feature }) {
  const queued = feature.status === "queued"
  const running = feature.status === "in_progress"
  const failed = feature.status === "failed"

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
      <p className="font-medium text-foreground">{feature.title}</p>
      <p className="mt-1 line-clamp-2 text-muted-foreground">{feature.description}</p>
    </div>
  )
}

function SortableKanbanCard({ feature }: { feature: Feature }) {
  const locked = feature.status === "queued" || feature.status === "in_progress"
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
    disabled: locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <div
        {...(locked ? {} : { ...attributes, ...listeners })}
        className={cn(locked ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
      >
        <KanbanCard feature={feature} />
      </div>
    </div>
  )
}

export function KanbanBoard({ features }: { features: Feature[] }) {
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

    setColumns((current) => {
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

      setFeaturesById((prev) => mergeStatusFromColumns(next, prev))
      return next
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
                return <SortableKanbanCard key={id} feature={f} />
              })}
            </SortableContext>
          </FeatureColumn>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeFeature ? (
          <div className="cursor-grabbing opacity-90 shadow-lg">
            <KanbanCard feature={activeFeature} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
