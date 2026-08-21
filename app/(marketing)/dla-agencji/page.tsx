import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ClipboardList,
  Gauge,
  MessageSquare,
  Package,
  Shield,
  Users,
} from 'lucide-react'
import AnimatedSection from '@/components/AnimatedSection'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import { ContactForm } from '@/components/contact-form'
import Footer from '@/components/sections/footer'
import { fetchPricingData } from '@/lib/pricing-data'
import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { fetchFaqSettings, resolveAgencjeFaq } from '@/lib/faq-data'
import { fetchPartnerSettings } from '@/lib/db/queries/partner'
import { buildPricingConditions, buildProcessSteps, formatPln } from '@/lib/data/partner'
import PartnerHero from './_components/partner-hero'
import PartnerCalculator from './_components/partner-calculator'
import { PartnerStickyBar } from './_components/partner-nav'
import {
  PARTNER_FORM_SECTION_ID,
  PARTNER_PRICING_SECTION_ID,
  audienceProfiles,
  cooperationModes,
  guarantees,
  moduleItems,
  proofRows,
  scrollbarSections,
} from './_content'

const canonical = 'https://syntance.com/dla-agencji'

export default async function DlaAgencjiPage() {
  const [pricingData, faqDoc, partner] = await Promise.all([
    fetchPricingData(),
    fetchFaqSettings(),
    fetchPartnerSettings(),
  ])
  const mins = getConfiguratorMinimumPricesNet(pricingData)
  const discoveryNet = strategiaWorkshopPriceNet(pricingData)
  const faqItems = resolveAgencjeFaq(faqDoc, mins, discoveryNet)
  const pricingConditions = buildPricingConditions(partner)
  const processSteps = buildProcessSteps(partner)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${canonical}#organization`,
        name: 'Syntance',
        url: 'https://syntance.com',
        description:
          'Studio dostarczające strony i sklepy internetowe na Next.js. Współpraca partnerska dla agencji, studiów brandingowych i freelancerów.',
        email: 'kontakt@syntance.com',
        telephone: '+48537110170',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Czerniec 72',
          addressLocality: 'Łącko',
          postalCode: '33-390',
          addressCountry: 'PL',
        },
        sameAs: ['https://linkedin.com/company/syntance', 'https://github.com/Syntance'],
      },
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: 'Współpraca partnerska: strony i sklepy Next.js dla agencji',
        serviceType: 'Podwykonawstwo web development dla agencji i studiów',
        provider: { '@id': `${canonical}#organization` },
        areaServed: { '@type': 'Country', name: 'Polska' },
        description:
          'Realizacja stron i sklepów Next.js dla agencji marketingowych, studiów brandingowych i freelancerów. Cena to procent od cennika detalicznego, termin objęty karą umowną, kod w repozytorium agencji. Tryb jawny albo white-label.',
        url: canonical,
        offers: {
          '@type': 'Offer',
          name: 'Audyt i specyfikacja projektu',
          price: String(partner.auditPriceNet),
          priceCurrency: 'PLN',
          description:
            'Płatny audyt zakresu i ryzyk zakończony specyfikacją. Kwota zaliczana na poczet pierwszego projektu.',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen w-full pb-28 md:pb-24" style={{ overflowX: 'clip' }}>
        <SubpageScrollbar sections={[...scrollbarSections]} />
        <PartnerStickyBar />

        <PartnerHero />

        {/* Dla kogo */}
        <section id="dla-kogo" className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Trzy sytuacje, w których to się spina
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Pracujemy jako warstwa wykonawcza pod cudzą marką albo obok niej. Poniżej trzy
                układy, w których robimy to najczęściej.
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {audienceProfiles.map((profile, i) => (
                <AnimatedSection key={profile.title} delay={i * 80}>
                  <div className="h-full p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-gray-300" aria-hidden />
                    </div>
                    <h3 className="text-white font-medium mb-3">{profile.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{profile.body}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Dwa tryby współpracy */}
        <section
          id="tryby"
          className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent"
        >
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Dwa tryby współpracy. <span className="text-violet-300">Wybierasz Ty.</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Różnica sprowadza się do jednego: czy w projekcie zostaje po nas ślad.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6">
              {cooperationModes.map((mode, i) => (
                <AnimatedSection key={mode.id} delay={i * 100}>
                  <div
                    className={`relative h-full p-8 rounded-2xl border ${
                      mode.recommended
                        ? 'border-violet-400/50 bg-violet-500/[0.07]'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    {mode.recommended && (
                      <span className="absolute -top-3 left-8 px-3 py-1 rounded-full text-xs bg-violet-500 text-white">
                        Domyślny
                      </span>
                    )}
                    <h3 className="text-2xl font-light text-white mb-1">{mode.name}</h3>
                    <p className="text-sm text-violet-200/80 mb-4">
                      {mode.price(partner.whiteLabelSurchargePercent)}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{mode.summary}</p>
                    <dl className="space-y-4">
                      {mode.rows.map((row) => (
                        <div key={row.label}>
                          <dt className="text-xs uppercase tracking-wider text-gray-500">
                            {row.label}
                          </dt>
                          <dd className="text-sm text-gray-300 mt-1">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection>
              <p className="mt-8 text-sm text-gray-400 leading-relaxed max-w-3xl">
                Anonimowość jest usługą dodatkową, nie rabatem. W trybie white-label rezygnujemy z
                portfolio i referencji z projektu — to realny koszt po naszej stronie i stąd ta dopłata.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Jak liczymy cenę */}
        <section id={PARTNER_PRICING_SECTION_ID} className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Procent od cennika detalicznego,{' '}
                <span className="text-cyan-300/90">nie osobny cennik pakietowy</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Podstawą jest kwota z konfiguratora na{' '}
                <Link href="/cennik" className="text-gray-300 underline underline-offset-4 hover:text-white">
                  /cennik
                </Link>{' '}
                — tego samego, z którego korzysta klient końcowy. Poziom partnerski obniża ją o
                stały procent.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm min-w-[560px]">
                  <caption className="sr-only">
                    Poziomy partnerskie i odpowiadające im rabaty od cennika detalicznego
                  </caption>
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th scope="col" className="p-4 font-medium text-white">
                        Poziom
                      </th>
                      <th scope="col" className="p-4 font-medium text-gray-300">
                        Kiedy obowiązuje
                      </th>
                      <th scope="col" className="p-4 font-medium text-gray-300">
                        Cena
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {partner.levels.map((level) => (
                      <tr key={level.id} className="border-b border-white/5">
                        <th scope="row" className="p-4 text-white font-medium text-left">
                          {level.name}
                        </th>
                        <td className="p-4 text-gray-400">{level.when}</td>
                        <td className="p-4 text-cyan-300/90 whitespace-nowrap">
                          detal −{level.discountPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="mt-8 grid md:grid-cols-2 gap-3">
                {pricingConditions.map((condition) => (
                  <li
                    key={condition}
                    className="flex gap-3 text-sm text-gray-400 leading-relaxed p-4 rounded-xl border border-white/10 bg-white/[0.02]"
                  >
                    <Check className="w-4 h-4 text-cyan-300/80 shrink-0 mt-0.5" aria-hidden />
                    {condition}
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection className="mt-10">
              <PartnerCalculator settings={partner} />
            </AnimatedSection>
          </div>
        </section>

        {/* Dlaczego szybciej */}
        <section
          id="moduly"
          className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-slate-900/40 to-transparent"
        >
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Projekt nie zaczyna się od pustego repozytorium
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Utrzymujemy własne monorepo modułów, których używamy w kolejnych wdrożeniach. Są
                napisane raz, przetestowane na produkcji i wchodzą do projektu jako zależność — nie
                jako kod pisany od nowa.
              </p>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleItems.map((module, i) => (
                <AnimatedSection key={module.name} delay={i * 50}>
                  <div className="h-full p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-blue-300 shrink-0" aria-hidden />
                      <p className="text-sm font-medium text-white font-mono">{module.name}</p>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{module.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection>
              <p className="mt-10 text-gray-400 leading-relaxed max-w-3xl">
                W typowym projekcie około 60% warstwy technicznej jest gotowe zanim zaczniemy. Praca
                idzie w to, co odróżnia projekt Twojego klienta od innych: design, treść i
                integracje. To jest powód, dla którego termin jest krótszy — i dlaczego możemy objąć
                go karą umowną.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Proces */}
        <section id="proces" className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Cztery kroki. Twój czas potrzebny w dwóch z nich.
              </h2>
              <p className="text-gray-400">
                Po Twojej stronie zostaje brief i akceptacja. Reszta idzie u nas.
              </p>
            </AnimatedSection>
            <div className="relative pl-8 md:pl-10">
              <div
                className="absolute left-[7px] md:left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-500 via-blue-500 to-emerald-500 opacity-40"
                aria-hidden
              />
              <ol className="space-y-10">
                {processSteps.map((step, i) => (
                  <AnimatedSection key={step.title} delay={i * 80}>
                    <li className="relative list-none">
                      <span
                        className="absolute -left-8 md:-left-10 top-1.5 w-3 h-3 rounded-full bg-violet-500 ring-2 ring-black"
                        aria-hidden
                      />
                      <p className="text-xs uppercase tracking-wider text-violet-300/90 mb-1">
                        {step.meta}
                      </p>
                      <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.text}</p>
                    </li>
                  </AnimatedSection>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Gwarancje */}
        <section
          id="gwarancje"
          className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-emerald-950/15 to-transparent"
        >
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Co jest <span className="text-emerald-300/90">zapisane w umowie</span>
              </h2>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guarantees.map((item, i) => (
                <AnimatedSection
                  key={item.name}
                  delay={i * 50}
                  className={item.highlight ? 'sm:col-span-2 lg:col-span-3' : ''}
                >
                  <div
                    className={`h-full p-6 rounded-2xl border ${
                      item.highlight
                        ? 'border-emerald-400/45 bg-emerald-500/[0.09]'
                        : 'border-emerald-500/20 bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
                      <h3
                        className={`font-medium text-white ${item.highlight ? 'text-lg' : ''}`}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Dowód */}
        <section id="dowod" className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
                Wynik z realizacji, nie z prezentacji
              </h2>
              <p className="text-gray-400">
                Sklep premium po migracji z WooCommerce na Next.js. Pomiary Google PageSpeed
                Insights, ten sam adres przed wdrożeniem i po publikacji. Klienta nie nazywamy —
                projekt był prowadzony na warunkach, które tego nie obejmują.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm min-w-[420px]">
                  <caption className="sr-only">
                    Porównanie wyników PageSpeed Insights przed wdrożeniem i po nim
                  </caption>
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th scope="col" className="p-4 font-medium text-white">
                        Metryka
                      </th>
                      <th scope="col" className="p-4 font-medium text-gray-400">
                        Przed
                      </th>
                      <th scope="col" className="p-4 font-medium text-gray-300">
                        Po
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proofRows.map((row) => (
                      <tr key={row.label} className="border-b border-white/5">
                        <th scope="row" className="p-4 text-gray-300 font-normal text-left">
                          {row.label}
                        </th>
                        <td className="p-4 text-gray-500">{row.before}</td>
                        <td className="p-4 text-emerald-300 font-medium">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Źródło: Google PageSpeed Insights. Pomiar „przed” — czerwiec 2026, pomiar „po” —
                czerwiec 2026, po publikacji nowego stacku.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq-partner" className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">FAQ</h2>
              <p className="text-gray-400">Pytania, które dostajemy od agencji i studiów</p>
            </AnimatedSection>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <AnimatedSection key={`${item.question}-${i}`} delay={i * 60}>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="text-white font-medium mb-2 flex gap-2">
                      <MessageSquare
                        className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"
                        aria-hidden
                      />
                      {item.question}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed pl-7">{item.answer}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + formularz */}
        <section
          id={PARTNER_FORM_SECTION_ID}
          className="relative z-10 py-28 px-6 lg:px-12 border-t border-white/10"
        >
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Zacznijmy od audytu
            </h2>
            <p className="text-lg text-gray-400 mb-4">
              {formatPln(partner.auditPriceNet)} netto, zaliczane na poczet pierwszego
              projektu. Dostajesz specyfikację, którą możesz wycenić gdziekolwiek — także u kogoś
              innego.
            </p>
            <p className="text-sm text-gray-500 mb-10">
              Jeśli zakres jest jeszcze nieokreślony, pracujemy godzinowo:{' '}
              {partner.hourlyRatePartner} PLN/h dla partnerów, {partner.hourlyRateRetail} PLN/h detalicznie.
            </p>

            <div className="text-left rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-300 shrink-0" aria-hidden />
                Formularz partnerski
              </h3>
              <ContactForm idPrefix="partner" source="dla-agencji" variant="partner" />
            </div>

            <p className="mt-10 text-sm text-gray-500">
              Odpowiadamy w ciągu 24 godzin roboczych.{' '}
              <Link
                href="/cennik"
                className="text-gray-400 underline underline-offset-4 hover:text-white inline-flex items-center gap-1"
              >
                Zobacz konfigurator cen
                <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </p>
          </AnimatedSection>
        </section>

        <Footer />
      </div>
    </>
  )
}
