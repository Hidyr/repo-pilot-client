"use client"

import * as React from "react"
import type { FitAddon } from "@xterm/addon-fit"
import type { Terminal as XTerm } from "xterm"

export type ReadonlyTerminalHandle = {
  write: (data: string) => void
  clear: () => void
  fit: () => void
}

function ReadonlyTerminal(
  props: {
    className?: string
  } & React.ComponentPropsWithoutRef<"div">,
  ref: React.ForwardedRef<ReadonlyTerminalHandle>
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const termRef = React.useRef<XTerm | null>(null)
  const fitRef = React.useRef<FitAddon | null>(null)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false
    let term: XTerm | null = null
    let fit: FitAddon | null = null
    let onDataDispose: { dispose: () => void } | null = null
    let onResize: (() => void) | null = null

    void Promise.all([
      import("xterm"),
      import("@xterm/addon-fit"),
      import("xterm/css/xterm.css"),
    ]).then(([{ Terminal: XTermCtor }, { FitAddon: FitAddonCtor }]) => {
      if (cancelled || !containerRef.current) return

      const nextTerm = new XTermCtor({
        convertEol: true,
        disableStdin: true,
        cursorBlink: false,
        cursorStyle: "block",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 11,
        lineHeight: 1.25,
        theme: {
          background: "#09090b", // zinc-950
          foreground: "#e4e4e7", // zinc-200
        },
        scrollback: 5000,
      })
      const nextFit = new FitAddonCtor()
      nextTerm.loadAddon(nextFit)
      nextTerm.open(containerRef.current)
      nextFit.fit()

      onDataDispose = nextTerm.onData(() => {
        /* ignore */
      })

      term = nextTerm
      fit = nextFit
      termRef.current = nextTerm
      fitRef.current = nextFit

      onResize = () => nextFit.fit()
      window.addEventListener("resize", onResize)
    })

    return () => {
      cancelled = true
      if (onResize) window.removeEventListener("resize", onResize)
      onDataDispose?.dispose()
      term?.dispose()
      term = null
      fit = null
      termRef.current = null
      fitRef.current = null
    }
  }, [])

  React.useImperativeHandle(
    ref,
    () => ({
      write: (data: string) => {
        termRef.current?.write(data)
      },
      clear: () => {
        termRef.current?.clear()
      },
      fit: () => {
        fitRef.current?.fit()
      },
    }),
    []
  )

  // eslint-disable-next-line react/prop-types
  const { className, ...rest } = props
  return (
    <div
      {...rest}
      className={className}
      ref={containerRef}
      aria-label="Terminal output"
      role="log"
    />
  )
}

ReadonlyTerminal.displayName = "ReadonlyTerminal"

export const ReadonlyTerminalView = React.forwardRef(ReadonlyTerminal)
