"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-3.5 data-[size=sm]:w-6 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-[#30d158] data-unchecked:bg-[#3a3a3a] dark:data-unchecked:bg-[#3a3a3a] data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white ring-0 transition-transform will-change-transform",
          "size-4 group-data-[size=sm]/switch:size-3",
          /* Same inset as off: translate-x-0.5 (= 0.125rem) on the left when unchecked → same gap on the right when checked */
          "group-data-[size=default]/switch:data-unchecked:translate-x-0.5 group-data-[size=default]/switch:data-checked:translate-x-[calc(2.25rem-1rem-0.125rem)]",
          "group-data-[size=sm]/switch:data-unchecked:translate-x-0.5 group-data-[size=sm]/switch:data-checked:translate-x-[calc(1.5rem-0.75rem-0.125rem)]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
