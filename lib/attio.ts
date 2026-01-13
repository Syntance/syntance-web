// Attio CRM Integration
// Dokumentacja API: https://developers.attio.com/reference/introduction

interface AttioContact {
  name: string;
  email: string;
  phone?: string;
}

interface AttioProject {
  name: string;
  contact: AttioContact;
  value: number; // Cena netto
  status: 'pending' | 'confirmed' | 'rejected' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
  days: number;
  deposit: number;
  bookingId: string;
  items: string[];
  complexity: string;
}

interface AttioRecordResponse {
  id: string;
  created_at: string;
}

const ATTIO_API_URL = 'https://api.attio.com/v2';

async function attioRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  const apiKey = process.env.ATTIO_API_KEY;
  
  if (!apiKey) {
    console.warn('ATTIO_API_KEY not configured - skipping Attio integration');
    return null;
  }

  try {
    const response = await fetch(`${ATTIO_API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Attio API error (${response.status}):`, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Attio API request failed:', error);
    return null;
  }
}

/**
 * Tworzy lub aktualizuje kontakt w Attio
 */
export async function createOrUpdateContact(contact: AttioContact): Promise<string | null> {
  // Najpierw sprawdź czy kontakt istnieje (po emailu)
  const existing = await attioRequest(
    `/objects/people/records/query`,
    'POST',
    {
      filter: {
        email_addresses: {
          any: {
            email_address: contact.email
          }
        }
      },
      limit: 1
    }
  );

  if (existing?.data?.[0]?.id) {
    // Kontakt istnieje - zwróć ID
    return existing.data[0].id.record_id;
  }

  // Stwórz nowy kontakt
  const newContact = await attioRequest(
    `/objects/people/records`,
    'POST',
    {
      data: {
        values: {
          name: [{ value: contact.name }],
          email_addresses: [{ 
            email_address: contact.email,
            attribute_type: 'work'
          }],
          ...(contact.phone && {
            phone_numbers: [{
              phone_number: contact.phone,
              attribute_type: 'work'
            }]
          })
        }
      }
    }
  );

  return newContact?.data?.id?.record_id || null;
}

/**
 * Tworzy projekt/deal w Attio
 */
export async function createProject(project: AttioProject): Promise<AttioRecordResponse | null> {
  // Najpierw stwórz/pobierz kontakt
  const contactId = await createOrUpdateContact(project.contact);
  
  if (!contactId) {
    console.error('Failed to create/get contact for project');
    return null;
  }

  // Stwórz projekt w Attio (używamy obiektu "deals" lub custom "projects")
  // Dostosuj nazwy pól do Twojego workspace w Attio
  const projectData = await attioRequest(
    `/objects/deals/records`,
    'POST',
    {
      data: {
        values: {
          name: [{ value: `${project.name} - ${project.contact.name}` }],
          status: [{ 
            value: project.status === 'pending' ? 'Oczekujące' :
                   project.status === 'confirmed' ? 'Potwierdzone' :
                   project.status === 'rejected' ? 'Odrzucone' :
                   project.status === 'in_progress' ? 'W realizacji' :
                   'Zakończone'
          }],
          value: [{ 
            value: project.value,
            currency_code: 'PLN'
          }],
          // Powiązanie z kontaktem
          people: [{ 
            referenced_actor_type: 'person-reference',
            referenced_actor_id: contactId
          }],
          // Custom fields - możesz je dodać w Attio
          ...(project.startDate && {
            'start_date': [{ value: project.startDate }]
          }),
          ...(project.endDate && {
            'end_date': [{ value: project.endDate }]
          }),
          'booking_id': [{ value: project.bookingId }],
          'days': [{ value: project.days }],
          'deposit': [{ value: project.deposit }],
          'complexity': [{ value: project.complexity }],
        }
      }
    }
  );

  // Dodaj notatkę z listą elementów
  if (projectData?.data?.id?.record_id && project.items.length > 0) {
    await attioRequest(
      `/notes`,
      'POST',
      {
        data: {
          parent_object: 'deals',
          parent_record_id: projectData.data.id.record_id,
          title: 'Wybrane elementy projektu',
          content: project.items.map((item, i) => `${i + 1}. ${item}`).join('\n'),
          format: 'plaintext'
        }
      }
    );
  }

  return projectData?.data;
}

/**
 * Aktualizuje status projektu w Attio
 */
export async function updateProjectStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'rejected' | 'in_progress' | 'completed'
): Promise<boolean> {
  // Znajdź projekt po booking_id
  const projects = await attioRequest(
    `/objects/deals/records/query`,
    'POST',
    {
      filter: {
        booking_id: {
          equals: bookingId
        }
      },
      limit: 1
    }
  );

  const projectId = projects?.data?.[0]?.id?.record_id;
  
  if (!projectId) {
    console.warn(`Project with booking_id ${bookingId} not found in Attio`);
    return false;
  }

  // Aktualizuj status
  const statusLabel = 
    status === 'pending' ? 'Oczekujące' :
    status === 'confirmed' ? 'Potwierdzone' :
    status === 'rejected' ? 'Odrzucone' :
    status === 'in_progress' ? 'W realizacji' :
    'Zakończone';

  const updated = await attioRequest(
    `/objects/deals/records/${projectId}`,
    'PATCH',
    {
      data: {
        values: {
          status: [{ value: statusLabel }]
        }
      }
    }
  );

  return !!updated;
}

/**
 * Dodaje notatkę do projektu
 */
export async function addProjectNote(
  bookingId: string,
  title: string,
  content: string
): Promise<boolean> {
  // Znajdź projekt
  const projects = await attioRequest(
    `/objects/deals/records/query`,
    'POST',
    {
      filter: {
        booking_id: {
          equals: bookingId
        }
      },
      limit: 1
    }
  );

  const projectId = projects?.data?.[0]?.id?.record_id;
  
  if (!projectId) {
    return false;
  }

  const note = await attioRequest(
    `/notes`,
    'POST',
    {
      data: {
        parent_object: 'deals',
        parent_record_id: projectId,
        title,
        content,
        format: 'plaintext'
      }
    }
  );

  return !!note;
}
