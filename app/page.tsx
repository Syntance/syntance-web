import HomePageClient from "@/app/home-page-client";
import { fetchPricingData } from "@/lib/pricing-data";
import { getConfiguratorMinimumPricesNet } from "@/lib/pricing-configurator-minimum";
import { discoveryPriceNetFromConfig } from "@/lib/pricing-calculator";
import { fetchFaqSettings, resolveHomeFaq } from "@/lib/faq-data";

// ISR — ceny w FAQ pochodzą z magazynu (Postgres); odświeżamy co 5 min bez przechodzenia na pełny SSR.
export const revalidate = 300;

export default async function HomePage() {
  const [data, faqDoc] = await Promise.all([fetchPricingData(), fetchFaqSettings()]);
  const mins = getConfiguratorMinimumPricesNet(data);
  const discoveryNet = discoveryPriceNetFromConfig(data.config);
  const faqItems = resolveHomeFaq(faqDoc, mins, discoveryNet);

  return <HomePageClient faqItems={faqItems} />;
}
