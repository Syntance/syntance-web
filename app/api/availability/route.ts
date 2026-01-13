import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Konfiguracja Google Calendar API
// Wymaga ustawienia zmiennych środowiskowych:
// - GOOGLE_CLIENT_EMAIL: email konta serwisowego
// - GOOGLE_PRIVATE_KEY: klucz prywatny (z \n zamienionymi na prawdziwe nowe linie)
// - GOOGLE_CALENDAR_ID: ID kalendarza (np. primary lub email)

const WORK_HOURS_PER_DAY = 6; // Godziny pracy dziennie
const WORK_DAYS = [1, 2, 3, 4, 5]; // Poniedziałek-Piątek (0=niedziela, 6=sobota)

interface BusySlot {
  start: string;
  end: string;
}

interface AvailabilityResponse {
  availableStartDates: string[]; // Daty w formacie YYYY-MM-DD
  busyDays: string[]; // Zajęte dni
  requiredDays: number;
}

// Pobierz zajętość z Google Calendar
async function getGoogleCalendarBusy(
  startDate: Date,
  endDate: Date
): Promise<BusySlot[]> {
  try {
    // Sprawdź czy mamy credentials
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn("Google Calendar credentials not configured, using fallback");
      return [];
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: process.env.GOOGLE_CALENDAR_ID || "primary" }],
      },
    });

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const busy = response.data.calendars?.[calendarId]?.busy || [];

    return busy.map((slot) => ({
      start: slot.start || "",
      end: slot.end || "",
    }));
  } catch (error) {
    console.error("Google Calendar API error:", error);
    return [];
  }
}

// Sprawdź czy dzień jest dniem roboczym
function isWorkDay(date: Date): boolean {
  return WORK_DAYS.includes(date.getDay());
}

// Pobierz wszystkie dni robocze między datami
function getWorkDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    if (isWorkDay(current)) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// Sprawdź czy dzień jest zajęty (ma jakiekolwiek wydarzenie)
function isDayBusy(date: Date, busySlots: BusySlot[]): boolean {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return busySlots.some((slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    
    // Sprawdź czy slot nachodzi na ten dzień
    return slotStart < dayEnd && slotEnd > dayStart;
  });
}

// Znajdź dostępne daty startu dla projektu o danej długości
function findAvailableStartDates(
  requiredWorkDays: number,
  busySlots: BusySlot[],
  searchStartDate: Date,
  searchEndDate: Date
): { availableDates: string[]; busyDays: string[] } {
  const allWorkDays = getWorkDaysBetween(searchStartDate, searchEndDate);
  const availableDates: string[] = [];
  const busyDays: string[] = [];

  // Oznacz zajęte dni
  const busyDaysSet = new Set<string>();
  for (const day of allWorkDays) {
    if (isDayBusy(day, busySlots)) {
      const dateStr = day.toISOString().split("T")[0];
      busyDaysSet.add(dateStr);
      busyDays.push(dateStr);
    }
  }

  // Dla każdego potencjalnego dnia startu sprawdź czy jest wystarczająco dni roboczych
  for (let i = 0; i < allWorkDays.length; i++) {
    const potentialStart = allWorkDays[i];
    const startDateStr = potentialStart.toISOString().split("T")[0];

    // Jeśli dzień startu jest zajęty - pomiń
    if (busyDaysSet.has(startDateStr)) continue;

    // Licz kolejne wolne dni robocze od tego dnia
    let consecutiveFreeWorkDays = 0;
    
    for (let j = i; j < allWorkDays.length && consecutiveFreeWorkDays < requiredWorkDays; j++) {
      const checkDay = allWorkDays[j];
      const checkDateStr = checkDay.toISOString().split("T")[0];
      
      if (busyDaysSet.has(checkDateStr)) {
        // Natrafiliśmy na zajęty dzień - przerwij liczenie
        break;
      }
      
      consecutiveFreeWorkDays++;
    }

    // Jeśli mamy wystarczająco wolnych dni - dodaj jako dostępną datę
    if (consecutiveFreeWorkDays >= requiredWorkDays) {
      availableDates.push(startDateStr);
    }
  }

  return { availableDates, busyDays };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const requiredDays = parseInt(searchParams.get("days") || "5", 10);
    const monthsAhead = parseInt(searchParams.get("months") || "3", 10);

    // Szukaj od jutra
    const searchStart = new Date();
    searchStart.setDate(searchStart.getDate() + 1);
    searchStart.setHours(0, 0, 0, 0);

    // Do X miesięcy w przód
    const searchEnd = new Date(searchStart);
    searchEnd.setMonth(searchEnd.getMonth() + monthsAhead);

    // Pobierz zajętość z Google Calendar
    const busySlots = await getGoogleCalendarBusy(searchStart, searchEnd);

    // Znajdź dostępne daty
    const { availableDates, busyDays } = findAvailableStartDates(
      requiredDays,
      busySlots,
      searchStart,
      searchEnd
    );

    const response: AvailabilityResponse = {
      availableStartDates: availableDates,
      busyDays,
      requiredDays,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache na 5 minut
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST - dodaj rezerwację do kalendarza
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, title, description, clientEmail, clientName } = body;

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      // Fallback - nie blokuj kalendarza, tylko zaloguj
      console.log("Would block calendar:", { startDate, endDate, title });
      return NextResponse.json({ ok: true, message: "Calendar not configured, logged only" });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Utwórz wydarzenie blokujące czas
    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      requestBody: {
        summary: `🚀 Realizacja: ${title}`,
        description: `Projekt dla: ${clientName} (${clientEmail})\n\n${description}`,
        start: {
          date: startDate, // Format YYYY-MM-DD dla całodniowego
        },
        end: {
          date: endDate,
        },
        colorId: "9", // Niebieski
        transparency: "opaque", // Blokuje czas
      },
    });

    return NextResponse.json({ 
      ok: true, 
      eventId: event.data.id,
      message: "Calendar blocked successfully" 
    });
  } catch (error) {
    console.error("Calendar block error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to block calendar" },
      { status: 500 }
    );
  }
}
