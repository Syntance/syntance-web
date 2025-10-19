import Navbar from "@/components/navbar";
import HeroHome from "@/components/sections/hero-home";
import FeaturesGrid from "@/components/sections/features-grid";
import CTA from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <HeroHome />
      <FeaturesGrid />
      <CTA />
      <Footer />
    </>
  );
}

