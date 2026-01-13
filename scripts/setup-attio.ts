/**
 * Skrypt automatycznej konfiguracji Attio CRM
 * Uruchom: npx tsx scripts/setup-attio.ts
 */

const ATTIO_API_URL = 'https://api.attio.com/v2';
const API_KEY = process.env.ATTIO_API_KEY;

if (!API_KEY) {
  console.error('❌ Brak ATTIO_API_KEY w .env.local');
  process.exit(1);
}

async function attioRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  const response = await fetch(`${ATTIO_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Attio API error (${response.status}): ${error}`);
  }

  return await response.json();
}

// 1. Skonfiguruj People (dodaj custom field "źródło")
async function setupPeople() {
  console.log('\n📋 Konfiguracja obiektu People...');
  
  try {
    // Dodaj pole "źródło"
    await attioRequest('/objects/people/attributes', 'POST', {
      data: {
        title: 'Źródło',
        api_slug: 'zrodlo',
        type: 'select',
        is_multiselect: false,
        config: {
          options: [
            { title: 'Konfigurator', color: 'blue' },
            { title: 'Kontakt bezpośredni', color: 'green' },
            { title: 'Polecenie', color: 'purple' }
          ]
        }
      }
    });
    console.log('  ✅ Dodano pole "Źródło"');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('  ℹ️  Pole "Źródło" już istnieje');
    } else {
      console.log('  ⚠️  Błąd dodawania pola "Źródło":', error.message);
    }
  }
}

// 2. Skonfiguruj Deals (dodaj wszystkie custom fields)
async function setupDeals() {
  console.log('\n📊 Konfiguracja obiektu Deals...');
  
  const fields = [
    {
      title: 'Booking ID',
      api_slug: 'booking_id',
      type: 'text',
      description: 'Unikalny numer rezerwacji (np. SYN-ABC123)'
    },
    {
      title: 'Data startu',
      api_slug: 'start_date',
      type: 'date',
      description: 'Data rozpoczęcia projektu'
    },
    {
      title: 'Data końca',
      api_slug: 'end_date',
      type: 'date',
      description: 'Szacowana data zakończenia'
    },
    {
      title: 'Zaliczka',
      api_slug: 'deposit',
      type: 'currency',
      config: {
        currency: 'PLN'
      },
      description: 'Zaliczka do zapłaty'
    },
    {
      title: 'Dni robocze',
      api_slug: 'days',
      type: 'number',
      description: 'Liczba dni roboczych realizacji'
    },
    {
      title: 'Złożoność',
      api_slug: 'complexity',
      type: 'select',
      is_multiselect: false,
      config: {
        options: [
          { title: 'Niska', color: 'green' },
          { title: 'Średnia', color: 'yellow' },
          { title: 'Wysoka', color: 'orange' },
          { title: 'Bardzo wysoka', color: 'red' }
        ]
      }
    },
    {
      title: 'Typ projektu',
      api_slug: 'project_type',
      type: 'select',
      is_multiselect: false,
      config: {
        options: [
          { title: 'Strona WWW', color: 'blue' },
          { title: 'Sklep e-commerce', color: 'purple' },
          { title: 'Aplikacja webowa', color: 'cyan' }
        ]
      }
    }
  ];
  
  for (const field of fields) {
    try {
      await attioRequest('/objects/deals/attributes', 'POST', { data: field });
      console.log(`  ✅ Dodano pole "${field.title}"`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`  ℹ️  Pole "${field.title}" już istnieje`);
      } else {
        console.log(`  ⚠️  Błąd dodawania pola "${field.title}":`, error.message);
      }
    }
  }
}

// 3. Skonfiguruj statusy w Deals
async function setupDealStatuses() {
  console.log('\n🎯 Konfiguracja statusów Deals...');
  
  try {
    // Pobierz obecną konfigurację atrybutu "status"
    const attributes = await attioRequest('/objects/deals/attributes');
    const statusAttr = attributes.data.find((attr: any) => attr.api_slug === 'status');
    
    if (!statusAttr) {
      console.log('  ⚠️  Nie znaleziono pola "status"');
      return;
    }
    
    // Zaktualizuj opcje statusu
    await attioRequest(`/objects/deals/attributes/${statusAttr.id.attribute_id}`, 'PATCH', {
      data: {
        config: {
          options: [
            { title: 'Oczekujące', color: 'yellow' },
            { title: 'Potwierdzone', color: 'green' },
            { title: 'W realizacji', color: 'blue' },
            { title: 'Zakończone', color: 'lime' },
            { title: 'Odrzucone', color: 'red' }
          ]
        }
      }
    });
    console.log('  ✅ Skonfigurowano statusy pipeline');
  } catch (error: any) {
    console.log('  ⚠️  Błąd konfiguracji statusów:', error.message);
    console.log('  💡 Dodaj statusy ręcznie w Settings → Objects → Deals → Status');
  }
}

// 4. Stwórz widoki (views) - API nie wspiera tworzenia views, trzeba ręcznie
async function setupViews() {
  console.log('\n👁️  Widoki (Views)...');
  console.log('  ℹ️  API Attio nie wspiera tworzenia widoków automatycznie');
  console.log('  📝 Stwórz ręcznie 4 widoki:');
  console.log('     1. Dashboard (wszystkie deals)');
  console.log('     2. Do akcji (filter: status = Oczekujące)');
  console.log('     3. Potwierdzone (filter: status = Potwierdzone lub W realizacji)');
  console.log('     4. Archiwum (filter: status = Zakończone lub Odrzucone)');
}

// Główna funkcja
async function main() {
  console.log('🚀 Automatyczna konfiguracja Attio CRM dla Syntance');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    await setupPeople();
    await setupDeals();
    await setupDealStatuses();
    await setupViews();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Konfiguracja zakończona!');
    console.log('\n📋 Następne kroki:');
    console.log('   1. Wejdź do Attio → Objects → Deals');
    console.log('   2. Sprawdź czy wszystkie pola się dodały');
    console.log('   3. Stwórz 4 widoki (instrukcja powyżej)');
    console.log('   4. Przetestuj rezerwację na stronie');
    console.log('\n💡 W razie problemów sprawdź: ATTIO_KONFIGURACJA_KROK_PO_KROKU.md');
    
  } catch (error) {
    console.error('\n❌ Błąd podczas konfiguracji:', error);
    console.log('\n💡 Skonfiguruj ręcznie według: ATTIO_KONFIGURACJA_KROK_PO_KROKU.md');
    process.exit(1);
  }
}

main();
