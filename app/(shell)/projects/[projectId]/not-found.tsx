import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[15px] font-medium text-foreground">Project not found</p>
      <p className="mt-2 text-[13px] text-muted-foreground">
        That project id is not in the demo list.
      </p>
      <Button className="mt-6" variant="chrome" render={<Link href="/projects" />}>
        Back to projects
      </Button>
    </div>
  )
}
