type HastRoot = { type: "root"; children?: unknown[] }

type HastElement = {
  type: "element"
  tagName: string
  properties?: Record<string, unknown>
  children?: unknown[]
}

function shouldLeaveUrl(url: string): boolean {
  const u = url.trim()
  if (!u) return true
  if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:")) return true
  if (u.startsWith("#")) return true
  // Site-root absolute paths are ambiguous (often GitHub-only); do not rewrite.
  if (u.startsWith("/") && !u.startsWith("//")) return true
  return false
}

function toReadmeAssetHref(projectId: string, apiBaseUrl: string, relativeUrl: string): string {
  const u = relativeUrl.trim()
  if (shouldLeaveUrl(u)) return relativeUrl
  const rel = u.replace(/^\.\//, "")
  const q = encodeURIComponent(rel)
  return `${apiBaseUrl}/projects/${projectId}/readme-asset?path=${q}`
}

function rewriteSrcset(srcset: string, rewriteOne: (u: string) => string): string {
  return srcset
    .split(",")
    .map((entry) => {
      const t = entry.trim()
      if (!t) return entry
      const parts = t.split(/\s+/)
      const url = parts[0] ?? ""
      const rest = parts.length > 1 ? ` ${parts.slice(1).join(" ")}` : ""
      return `${rewriteOne(url)}${rest}`
    })
    .join(", ")
}

function visitElements(nodes: unknown[], fn: (el: HastElement) => void) {
  for (const n of nodes) {
    if (!n || typeof n !== "object") continue
    const node = n as { type?: string; children?: unknown[]; tagName?: string }
    if (node.type === "element" && node.tagName) {
      fn(n as HastElement)
    }
    if (Array.isArray(node.children) && node.children.length) {
      visitElements(node.children, fn)
    }
  }
}

/**
 * Rewrites repo-relative `src` / `srcSet` / relative `href` to API URLs so README media works
 * from the Next.js app (browser-relative URLs would resolve against `/projects/...` and 404).
 * Must run **before** `rehype-sanitize` so `hast-util-sanitize` keeps `http(s)` URLs.
 */
export function rehypeRewriteProjectReadmeAssets(
  projectId: string,
  apiBaseUrl: string | null
): () => (tree: HastRoot) => void {
  return function rehypeRewriteProjectReadmeAssetsPlugin() {
    return function (tree: HastRoot) {
      if (!apiBaseUrl) return
      const rw = (u: string) => toReadmeAssetHref(projectId, apiBaseUrl, u)
      visitElements(tree.children as unknown[], (el) => {
        const props = el.properties ?? {}
        if (el.tagName === "img" && typeof props.src === "string") {
          props.src = rw(props.src)
        }
        if (el.tagName === "source") {
          const srcSetVal = props.srcSet ?? props.srcset
          if (typeof srcSetVal === "string") {
            props.srcSet = rewriteSrcset(srcSetVal, rw)
            delete props.srcset
          }
        }
        if (el.tagName === "a" && typeof props.href === "string") {
          props.href = rw(props.href)
        }
      })
    }
  }
}
