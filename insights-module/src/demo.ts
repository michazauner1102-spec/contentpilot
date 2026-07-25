import { InsightsService } from "./insightsService";
import { demoVideoMetas } from "./mockInsightsProvider";

async function main() {
  const service = InsightsService.withMockData();
  const performance = await service.importPerformance(demoVideoMetas());
  const grouped = service.groupByBereich(performance);
  console.log(JSON.stringify({ performance, grouped }, null, 2));
}

main().catch(console.error);
