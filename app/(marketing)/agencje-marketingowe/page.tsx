import AgencjeMarketingoweClient from './agencje-marketingowe-client'

const canonical = 'https://syntance.com/agencje-marketingowe'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${canonical}#organization`,
      name: 'Syntance',
      url: 'https://syntance.com',
      description:
        'Studio dostarczające strony i sklepy internetowe. Model partnerski white-label dla agencji marketingowych.',
      email: 'kontakt@syntance.com',
      telephone: '+48662519544',
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
      name: 'White-label: strony internetowe dla agencji marketingowych',
      serviceType: 'Web development pod marką agencji',
      provider: { '@id': `${canonical}#organization` },
      areaServed: {
        '@type': 'Country',
        name: 'Polska',
      },
      description:
        'Realizacja stron pod marką agencji: NDA, PageSpeed 96+, SLA, marża partnerska. Bez kontaktu z końcowym klientem agencji.',
      url: canonical,
    },
    {
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Mam freelancera na WP, po co mi to?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Freelancer często kończy na niskim wyniku w PageSpeed. W modelu WL kupujesz np. od 2,9 tys., sprzedajesz np. za 8 tys. — zostaje marża przy wyższej jakości.',
          },
        },
        {
          '@type': 'Question',
          name: 'Za drogo — freelancer WP bierze 3k.',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Freelancer za 3 tys. to często słaba wydajność i brak gwarancji. W pakiecie partnerskim od 2 900 PLN masz PageSpeed 96+, CMS, SLA i NDA.',
          },
        },
        {
          '@type': 'Question',
          name: 'Klient nie zna headless, chce WP.',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Klient nie kupuje technologii — kupuje wynik. Panel treści jest prosty w obsłudze; dla klienta wygląda jak zwykła strona do edycji.',
          },
        },
        {
          '@type': 'Question',
          name: 'A co jeśli klient chce zmiany?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Treści edytuje klient w CMS; zmiany w zakresie rozwoju obsługujemy w kanale partnerskim z SLA odpowiedzi.',
          },
        },
        {
          '@type': 'Question',
          name: 'Nie chcę NDA.',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'NDA chroni Twój model: nie kontaktujemy się z Twoim klientem i nie ujawniamy współpracy.',
          },
        },
        {
          '@type': 'Question',
          name: 'Jak wygląda komunikacja?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Jeden kanał (Slack lub Teams): brief od Ciebie → realizacja → akceptacja po Twojej stronie.',
          },
        },
      ],
    },
  ],
}

export default function AgencjeMarketingowePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AgencjeMarketingoweClient />
    </>
  )
}
