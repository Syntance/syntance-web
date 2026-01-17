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

// Logo Syntance jako JPEG base64 (sygnet + tekst)
const LOGO_BASE64 = '/9j/4AAQSkZJRgABAQIAHAAcAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCABAANABAREA/8QAHgABAAIDAQEBAQEAAAAAAAAAAAkIBgcKBQQBAwL/xABEEAABAwMDAgMEBQkHAwUAAAABAAIDBAURBgcIEiETMWFRcYGRCSIyQqEUFSMzQlJicpIWJCU0U4KxFzXBQ2Oi0tH/2gAIAQEAAD8A6poiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIi17urv1ovbbc7X7qagq6mivlXR0tso6WFsr6qqqJBHDG0OIAy5wySQABkqKv0uHJi5cZrJou46o1rqK31W4FJd6OkZpq3VJlp4IZIZHB8rYi0PkIc0BpOAAck9ioPbgaDrtr91aS32k3uKmtjKu7XGup6GJ0jA17Io2Aue8tPcNaMAd+5wRkYciIiIiIiIiIiIiIiIiIiIiIiIiIiIil88Dbl1x0+2/wBN9Tblam1JrfTNZR1NLLfb26tNNUQVEclVTiYkyMge+KNzWOLmjsWgBpAj78R7x7Nc0t7ty6rZjcS2a80xZrfT2qOttVY2pgllp2kTODm9ukv6iO+M9u/dbYREREREREREREREREREREREREREVi+n/wBc3I7p7unQ+w2j9wNWUel7xqC42qpt1HqCqhp5oJal8kTnRtkDHODHDJIJBAPuvb8Ujl7vLy76tHbjcdyLFprTVy0taqm3C02mkmhDJJKmKbrc6aeVxdmMA5GOw7e/f1EREREREREREREREREREREREREXqaY1JqHR+obTq7R97rbHqCyVsNfaLrb53Q1NHVQvEkU0UjCHMe17WuaQQQQCqrchvpTOaO127Fz0ht9pjRmpNH224VFBQaiorrWQ11W2CRzGTzQNgMbRIWh3SA7pDgOo9yRa4REREREREREREREREREREREREX/9k='

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
  // Logo Syntance (JPEG) - sygnet + tekst
  try {
    doc.addImage(LOGO_BASE64, 'JPEG', margin, y - 2, 50, 12)
  } catch {
    // Fallback do tekstu jesli obrazek nie zadziala
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(20)
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
  doc.text('Zaliczka (50%):', labelX, boxStartY + rowHeight * 3)
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
  
  // Mini logo w stopce
  try {
    doc.addImage(LOGO_BASE64, 'JPEG', margin, footerY - 4, 20, 5)
  } catch {
    // Fallback
  }
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Wycena wazna 30 dni od daty wystawienia', margin + 25, footerY)
  doc.text('kontakt@syntance.com', pageWidth / 2, footerY, { align: 'center' })
  doc.text('www.syntance.com', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ ===
  const fileName = `Wycena_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
