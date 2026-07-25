export {
  buildNischeQueries,
  defaultWebResearchProvider,
  parseWebResearchProvider,
  RESEARCH_WEB_PROVIDER_OPTIONS,
  runWebResearchWithProvider,
  webResearchSourceLabel,
  type WebResearchProviderId,
  type WebResearchResult,
  type WebResearchSource,
} from "@/lib/research/webResearchProviders";

import {
  defaultWebResearchProvider,
  runWebResearchWithProvider,
  type WebResearchProviderId,
  type WebResearchResult,
} from "@/lib/research/webResearchProviders";

export async function runWebResearch(
  nische: string,
  provider: WebResearchProviderId = defaultWebResearchProvider()
): Promise<WebResearchResult> {
  return runWebResearchWithProvider(nische, provider);
}
