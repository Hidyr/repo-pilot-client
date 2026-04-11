"use client"

import { Icon } from "@iconify/react/offline"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { registerIdeIconifyIcons } from "@/lib/icons/register-ide-iconify"
import { openProjectInIde, type AvailableIdeClis, type IdeId } from "@/lib/os/ide-cli"
import { cn } from "@/lib/utils"

const IDE_ROWS: readonly {
  id: IdeId
  icon: string
  label: string
}[] = [
  { id: "vscode", icon: "devicon-plain:vscode", label: "Open in VS Code" },
  { id: "cursor", icon: "devicon-plain:cursor", label: "Open in Cursor" },
  {
    id: "antigravity",
    icon: "material-symbols:antigravity-outline",
    label: "Open in Antigravity",
  },
  { id: "intellij", icon: "devicon-plain:intellij", label: "Open in IntelliJ IDEA" },
]

export function ProjectIdeLaunch({
  localPath,
  available,
  className,
}: {
  localPath: string
  available: AvailableIdeClis
  className?: string
}) {
  registerIdeIconifyIcons()

  const visible = IDE_ROWS.filter((row) => available[row.id])
  if (visible.length === 0) return null

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-0.5 border-t border-border/60 pt-2",
        className
      )}
    >
      {visible.map((row) => (
        <Tooltip key={row.id}>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground hover:text-foreground [&_svg]:size-5"
                aria-label={row.label}
                onClick={() => {
                  void openProjectInIde(row.id, localPath)
                }}
              />
            }
          >
            <Icon icon={row.icon} width={20} height={20} aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="top">{row.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
