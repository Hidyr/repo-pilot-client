import type { Feature, FeatureStatus } from "@/lib/api/types"

export function mapFeatureRow(row: Record<string, unknown>): Feature {
  return {
    id: String(row.id ?? ""),
    projectId: String(row.projectId ?? ""),
    title: String(row.title ?? ""),
    description: (row.description as string | null) ?? null,
    userPrompt: (row.userPrompt as string | null) ?? null,
    status: (row.status as FeatureStatus) ?? "pending",
    frozen: Boolean(row.frozen === true || row.frozen === 1 || row.frozen === "1"),
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  }
}
