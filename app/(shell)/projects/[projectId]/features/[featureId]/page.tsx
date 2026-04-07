import { notFound } from "next/navigation"

import { FeatureDetailView } from "@/components/projects/feature-detail-view"
import { getFeatureForProject, getRunsForFeature } from "@/lib/api/server-data"

export default async function ProjectFeaturePage({
  params,
}: {
  params: Promise<{ projectId: string; featureId: string }>
}) {
  const { projectId, featureId } = await params
  const feature = await getFeatureForProject(projectId, featureId)
  if (!feature) notFound()
  const initialRuns = await getRunsForFeature(projectId, featureId, 5)

  return <FeatureDetailView feature={feature} initialRuns={initialRuns} />
}
