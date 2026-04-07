"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { apiBase } from "@/lib/api/env"

import "github-markdown-css/github-markdown.css"

export function ProjectReadmeView({ projectId }: { projectId: string }) {
  const [readme, setReadme] = React.useState<{ exists: boolean; markdown: string } | null>(null)

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
    <section className="readme-github-panel">
      <h2 className="mb-3 text-[13px] font-medium text-foreground">README</h2>
      {!readme ? (
        <p className="text-[12px] text-muted-foreground">Loading…</p>
      ) : !readme.exists ? (
        <p className="text-[12px] text-muted-foreground">
          No README.md in the project root.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="readme-github-scroll overflow-x-auto">
            <article
              className="markdown-body !my-0 box-border min-w-[200px] max-w-[980px] px-4 py-6 md:px-10 md:py-8"
              style={{
                margin: "0 auto",
                borderRadius: 0,
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
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
