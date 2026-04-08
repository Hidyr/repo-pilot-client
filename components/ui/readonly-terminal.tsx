 "use client"
 
 import * as React from "react"
 import { Terminal as XTerm } from "xterm"
 import { FitAddon } from "@xterm/addon-fit"
 import "xterm/css/xterm.css"
 
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
     if (!containerRef.current) return
     const term = new XTerm({
       convertEol: true,
       disableStdin: true,
       cursorBlink: false,
       cursorStyle: "block",
       fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
       fontSize: 11,
       lineHeight: 1.25,
       theme: {
         background: "#09090b", // zinc-950
         foreground: "#e4e4e7", // zinc-200
       },
       scrollback: 5000,
     })
     const fit = new FitAddon()
     term.loadAddon(fit)
     term.open(containerRef.current)
     fit.fit()
 
     // Extra guard against input (disableStdin already handles most).
     const onDataDispose = term.onData(() => {
       /* ignore */
     })
 
     termRef.current = term
     fitRef.current = fit
 
     const onResize = () => fit.fit()
     window.addEventListener("resize", onResize)
 
     return () => {
       window.removeEventListener("resize", onResize)
       onDataDispose.dispose()
       term.dispose()
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
