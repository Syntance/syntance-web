// Przykłady użycia obrazów z SEO-friendly nazwami i alt atrybutami
// NIE ZMIENIA widocznych treści - tylko techniczne atrybuty

import Image from 'next/image';
import ImageSmart from '@/components/ImageSmart';

export const SeoImagesExamples = () => {
  return (
    <>
      {/* Logo Syntance */}
      <Image
        src="/icons/syntance-logo.svg"
        alt="Syntance - Studio technologiczne AI-first"
        width={120}
        height={120}
        priority
      />

      {/* Hero Image - Syntance Studio */}
      <ImageSmart
        src="/images/syntance-studio-hero-1920x1080.webp"
        alt="Syntance Studio - projektowanie stron internetowych i sklepów online"
        width={1920}
        height={1080}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1920px"
        priority
        loading="eager"
      />

      {/* Syntance AI Dashboard */}
      <ImageSmart
        src="/images/syntance-ai-dashboard-1440x900.avif"
        alt="Syntance AI - dashboard automatyzacji procesów biznesowych"
        width={1440}
        height={900}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1440px"
      />

      {/* Portfolio showcase */}
      <ImageSmart
        src="/images/syntance-web-development-showcase-1280x720.webp"
        alt="Portfolio Syntance - przykładowe realizacje stron internetowych w Next.js"
        width={1280}
        height={720}
      />

      {/* Product icons with SEO names */}
      <Image
        src="/icons/syntance-studio-icon.svg"
        alt="Ikona Syntance Studio"
        width={64}
        height={64}
      />

      <Image
        src="/icons/syntance-ai-icon.svg"
        alt="Ikona Syntance AI"
        width={64}
        height={64}
      />

      {/* Team/Founder image */}
      <ImageSmart
        src="/images/kamil-podobinski-ceo-syntance-400x400.webp"
        alt="Kamil Podobiński - CEO i Founder Syntance"
        width={400}
        height={400}
      />

      {/* Technology stack icons */}
      <Image
        src="/icons/nextjs-technology-icon.svg"
        alt="Next.js - technologia używana w Syntance"
        width={48}
        height={48}
      />

      <Image
        src="/icons/react-technology-icon.svg"
        alt="React - technologia używana w Syntance"
        width={48}
        height={48}
      />

      <Image
        src="/icons/ai-ml-technology-icon.svg"
        alt="AI i Machine Learning - technologie Syntance"
        width={48}
        height={48}
      />

      {/* Client testimonials */}
      <ImageSmart
        src="/images/syntance-client-testimonial-800x600.webp"
        alt="Opinie klientów Syntance - zadowoleni klienci"
        width={800}
        height={600}
      />

      {/* Office/workspace */}
      <ImageSmart
        src="/images/syntance-workspace-office-1600x900.avif"
        alt="Biuro Syntance - przestrzeń pracy zespołu"
        width={1600}
        height={900}
      />

      {/* Project screenshots */}
      <ImageSmart
        src="/images/syntance-project-ecommerce-1280x800.webp"
        alt="Projekt sklepu e-commerce zrealizowany przez Syntance"
        width={1280}
        height={800}
      />

      <ImageSmart
        src="/images/syntance-project-corporate-website-1280x800.webp"
        alt="Strona korporacyjna stworzona przez Syntance Studio"
        width={1280}
        height={800}
      />

      {/* Social media OG images */}
      <Image
        src="/og/og-home-1200x630.png"
        alt="Syntance - Studio technologiczne AI-first w Polsce"
        width={1200}
        height={630}
        priority={false}
      />

      <Image
        src="/og/og-studio-1200x630.png"
        alt="Syntance Studio - tworzenie stron internetowych"
        width={1200}
        height={630}
      />

      <Image
        src="/og/og-ai-1200x630.png"
        alt="Syntance AI - rozwiązania sztucznej inteligencji"
        width={1200}
        height={630}
      />
    </>
  );
};

// Alt text patterns dla SEO:
// 1. Zawsze zawieraj nazwę firmy "Syntance"
// 2. Opisuj co jest na obrazku
// 3. Używaj słów kluczowych: AI, studio technologiczne, strony internetowe, sklepy online, Next.js
// 4. Bądź konkretny i zwięzły (max 125 znaków)
// 5. Dla ikon użyj "Ikona" + nazwa
// 6. Dla ludzi podaj imię i funkcję
// 7. Dla projektów opisz typ projektu
