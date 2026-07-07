import HomePageClient from "@/app/home-page-client";
import { fetchPricingData } from "@/lib/pricing-data";
import { getConfiguratorMinimumPricesNet } from "@/lib/pricing-configurator-minimum";
import { strategiaWorkshopPriceNet } from "@/lib/pricing-calculator";
import { fetchFaqSettings, resolveHomeFaq } from "@/lib/faq-data";
import { fetchStackBadges } from "@/lib/stack-badges-data";

// ISR — ceny w FAQ pochodzą z magazynu (Postgres); odświeżamy co 5 min bez przechodzenia na pełny SSR.
export const revalidate = 300;

export default async function HomePage() {
  const [data, faqDoc, stackBadges] = await Promise.all([
    fetchPricingData(),
    fetchFaqSettings(),
    fetchStackBadges(),
  ]);
  const mins = getConfiguratorMinimumPricesNet(data);
  const discoveryNet = strategiaWorkshopPriceNet(data);
  const faqItems = resolveHomeFaq(faqDoc, mins, discoveryNet);

  return <HomePageClient faqItems={faqItems} stackBadges={stackBadges} />;
}
