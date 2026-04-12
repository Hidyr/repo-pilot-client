"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"

import { apiBase } from "@/lib/api/env"
import { rehypeRewriteProjectReadmeAssets } from "@/lib/readme/rehype-rewrite-project-readme-assets"
import { cn } from "@/lib/utils"

import "github-markdown-css/github-markdown.css"

export function ProjectReadmeView({ projectId }: { projectId: string }) {
  const [readme, setReadme] = React.useState<{ exists: boolean; markdown: string } | null>(null)
  const b = apiBase()
  const rehypePlugins = React.useMemo(
    () => [
      rehypeRaw,
      rehypeRewriteProjectReadmeAssets(projectId, b),
      rehypeSanitize,
    ],
    [projectId, b]
  )

  React.useEffect(() => {
    const b = apiBase()
    if (!b) return
    let cancelled = false
    fetch(`${b}/projects/${projectId}/readme`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: { exists?: boolean; markdown?: string } } | null) => {
        if (cancelled) return
        setReadme({
          exists: j?.data?.exists === true,
          markdown: String(j?.data?.markdown ?? ""),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [projectId])

  return (
    <section className="readme-github-panel min-w-0 w-full">
      <h2 className="mb-3 text-[13px] font-medium text-foreground">README</h2>
      {!readme ? (
        <p className="text-[12px] text-muted-foreground">Loading…</p>
      ) : !readme.exists ? (
        <p className="text-[12px] text-muted-foreground">
          No README.md in the project root.
        </p>
      ) : (
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
            <article
              className={cn(
                "markdown-body !my-0 box-border w-full min-w-0 max-w-full px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-8",
                "[&_pre]:max-w-full [&_pre]:overflow-x-auto"
              )}
              style={{ borderRadius: 0 }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={rehypePlugins}
                components={{
                  a: ({ href, children, ...props }) => {
                    const external =
                      typeof href === "string" && /^https?:\/\//i.test(href)
                    return (
                      <a
                        href={href}
                        {...props}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                      >
                        {children}
                      </a>
                    )
                  },
                  img: ({ alt, src, ...props }) => (
                    <img
                      alt={alt ?? ""}
                      src={typeof src === "string" ? src : undefined}
                      {...props}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  ),
                }}
              >
                {readme.markdown}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      )}
    </section>
  )
}
