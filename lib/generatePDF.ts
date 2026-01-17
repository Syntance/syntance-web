import { jsPDF } from 'jspdf'

// Logo PNG jako base64
const LOGO_BASE64 = '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'

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

export function generatePricingPDF(data: PDFData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let y = margin

  // === HEADER ===
  // Logo Syntance - PNG
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, y - 5, 50, 15)
  } catch (e) {
    // Fallback do tekstu jesli obrazek nie zadziala
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Syntance', margin, y + 7)
  }
  
  // Dane klienta po prawej (z placeholderami)
  const rightX = pageWidth - margin
  let clientY = y
  
  // Data
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.setFontSize(10)
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  const dateText = data.date ? removePolishChars(currentDate) : '[Data]'
  doc.text(dateText, rightX, clientY, { align: 'right' })
  clientY += 5
  
  // Imie i Nazwisko
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  const nameText = data.clientName ? removePolishChars(data.clientName) : '[Imie i Nazwisko]'
  doc.text(nameText, rightX, clientY, { align: 'right' })
  clientY += 5
  
  // Telefon
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  const phoneText = data.clientPhone || '[nr.tel]'
  doc.text(phoneText, rightX, clientY, { align: 'right' })
  clientY += 5
  
  // Email
  const emailText = data.clientEmail || '[email]'
  doc.text(emailText, rightX, clientY, { align: 'right' })
  
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
        doc.text('Indywidualna', col3, y)
        doc.text('-', col4, y, { align: 'right' })
      } else {
        doc.text(`${item.price.toLocaleString('pl-PL')} zl`, col3, y)
        doc.setTextColor(...hexToRgb(COLORS.black))
        doc.text(`${item.total.toLocaleString('pl-PL')} zl`, col4, y, { align: 'right' })
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
