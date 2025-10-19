import Navbar from "@/components/navbar";
import HeroStudio from "@/components/sections/hero-studio";
import PricingStudio from "@/components/sections/pricing-studio";
import CTA from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

export const metadata = {
  title: "Studio — Syntance",
  description:
    "Tworzenie stron i sklepów. Deepsite v2 → Next.js / WordPress / WooCommerce.",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <HeroStudio />
      <PricingStudio />
      <CTA />
      <Footer />
    </>
  );
}

