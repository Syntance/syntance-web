import { jsPDF } from 'jspdf'

// Kolory
const COLORS = {
  black: '#1A1A1A',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#E5E7EB',
  purple: '#8B5CF6',
}

export interface PDFItem {
  name: string
  quantity: number
  price: number
  total: number
  includedInBase?: boolean
  required?: boolean
  hidePrice?: boolean
}

export interface PDFData {
  projectType: string
  projectTypeDescription?: string
  items: PDFItem[]
  priceNetto: number
  priceBrutto: number
  deposit: number
  vatRate: number
  days: number
  hours: number
  complexity: 'low' | 'medium' | 'high' | 'very-high'
  complexityDays: number
  complexityPrice: number
  date?: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}


// Funkcja do zamiany polskich znakow na ASCII (jsPDF nie obsluguje UTF-8)
function removePolishChars(text: string): string {
  const polishMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
    'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  }
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, char => polishMap[char] || char)
}

// Funkcja do ladowania logo jako base64
async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/icons/Logo Sygnet Syntance V.3.jpeg')
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function generatePricingPDF(data: PDFData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let y = margin

  // === HEADER ===
  // Logo Syntance - ladowane dynamicznie
  const logoWidth = 60
  const logoHeight = 18
  const logoY = y + 2
  
  // Laduj logo
  const logoBase64 = await loadLogoAsBase64()
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', margin, logoY, logoWidth, logoHeight)
    } catch {
      // Fallback do tekstu jesli obrazek nie zadziala
      doc.setTextColor(...hexToRgb(COLORS.black))
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('Syntance', margin, y + 12)
    }
  } else {
    // Fallback do tekstu jesli nie udalo sie zaladowac
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Syntance', margin, y + 12)
  }
  
  // Data po prawej stronie (na rowni z logo)
  const rightX = pageWidth - margin
  const currentDate = new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  // Tekst jest wyrownywany do baseline, wiec dodajemy korekte (+1.5mm) zeby srodek tekstu byl na srodku logo
  const dateY = logoY + (logoHeight / 2) + 1.5
  doc.setFontSize(11)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'normal')
  doc.text(removePolishChars(currentDate), rightX, dateY, { align: 'right' })
  
  y += 30

  // === TYTUŁ WYŚRODKOWANY ===
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('WYCENA PROJEKTU', pageWidth / 2, y, { align: 'center' })
  
  y += 6
  
  // Linia pod tytulem
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  
  y += 12
  
  // Typ projektu
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(removePolishChars(data.projectType), margin, y)
  
  y += 12

  // Rozdziel elementy na bazę projektu i konfigurację
  const baseItems = data.items.filter(item => item.required || item.includedInBase)
  const configItems = data.items.filter(item => !item.required && !item.includedInBase)
  
  // Pozycje kolumn
  const col1 = margin  // Element
  const col2 = margin + 90  // Ilość
  const col3 = margin + 110  // Cena
  const col4 = pageWidth - margin  // Suma (wyrównanie do prawej)

  // Funkcja do rysowania naglowkow tabeli
  const drawTableHeaders = () => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.text('Element', col1, y)
    doc.text('Szt.', col2, y)
    doc.text('Cena', col3, y)
    doc.text('Suma', col4, y, { align: 'right' })
    
    y += 4
    doc.setDrawColor(...hexToRgb(COLORS.border))
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
  }

  // Funkcja do rysowania elementu
  const drawItem = (item: PDFItem, isBase: boolean) => {
    // Nowa strona jeśli brakuje miejsca
    if (y > pageHeight - 70) {
      doc.addPage()
      y = margin
    }
    
    // Nazwa elementu (bez polskich znakow)
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    // Usun polskie znaki i skroc nazwe jesli za dluga
    let itemName = removePolishChars(item.name)
    if (doc.getTextWidth(itemName) > 85) {
      while (doc.getTextWidth(itemName + '...') > 85 && itemName.length > 0) {
        itemName = itemName.slice(0, -1)
      }
      itemName += '...'
    }
    doc.text(itemName, col1, y)
    
    // Ilość
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.text(item.quantity.toString(), col2, y)
    
    // Cena jednostkowa i suma dla bazy projektu
    if (isBase) {
      doc.setTextColor(...hexToRgb(COLORS.gray))
      doc.text('W cenie', col3, y)
      doc.setTextColor(...hexToRgb(COLORS.purple))
      doc.text('Gratis', col4, y, { align: 'right' })
    } else {
      // Cena jednostkowa
      if (item.hidePrice) {
        // Puste miejsce zamiast ceny
        doc.text('', col3, y)
        doc.text('', col4, y, { align: 'right' })
      } else {
        doc.text(`${item.price.toLocaleString('pl-PL')} zl netto`, col3, y)
        doc.setTextColor(...hexToRgb(COLORS.black))
        doc.text(`${item.total.toLocaleString('pl-PL')} zl netto`, col4, y, { align: 'right' })
      }
    }
    
    y += 7
  }

  // === BAZA PROJEKTU ===
  if (baseItems.length > 0) {
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Baza projektu (${baseItems.length})`, margin, y)
    
    y += 8
    drawTableHeaders()
    
    baseItems.forEach(item => drawItem(item, true))
    
    y += 8
  }

  // === KONFIGURACJA ===
  if (configItems.length > 0) {
    // Nowa strona jeśli brakuje miejsca
    if (y > pageHeight - 100) {
      doc.addPage()
      y = margin
    }
    
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Konfiguracja (${configItems.length})`, margin, y)
    
    y += 8
    drawTableHeaders()
    
    configItems.forEach(item => drawItem(item, false))
  }
  
  y += 5
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.line(margin, y, pageWidth - margin, y)
  y += 12

  // === PODSUMOWANIE ===
  if (y > pageHeight - 80) {
    doc.addPage()
    y = margin
  }
  
  const summaryBoxHeight = 60
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, contentWidth, summaryBoxHeight, 3, 3, 'S')
  
  const boxStartY = y + 12
  const labelX = margin + 15
  const valueX = pageWidth - margin - 15
  const rowHeight = 11
  
  // Cena netto
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Cena netto:', labelX, boxStartY)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, valueX, boxStartY, { align: 'right' })
  
  // Cena brutto
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Cena brutto (z VAT):', labelX, boxStartY + rowHeight)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, valueX, boxStartY + rowHeight, { align: 'right' })
  
  // Czas realizacji
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Czas realizacji:', labelX, boxStartY + rowHeight * 2)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni roboczych`, valueX, boxStartY + rowHeight * 2, { align: 'right' })
  
  // Zaliczka
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Zaliczka (20%):', labelX, boxStartY + rowHeight * 3)
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, valueX, boxStartY + rowHeight * 3, { align: 'right' })
  
  y += summaryBoxHeight + 10

  // === LEGENDA ===
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Baza projektu - elementy wliczone w cene bazowa', margin, y)
  doc.text('Konfiguracja - dodatkowo wybrane elementy', margin, y + 4)

  // === STOPKA ===
  const footerY = pageHeight - 15
  
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Wycena wazna 30 dni od daty wystawienia', margin, footerY)
  doc.text('kontakt@syntance.com', pageWidth / 2, footerY, { align: 'center' })
  doc.text('www.syntance.com', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ ===
  const fileName = `Wycena_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
