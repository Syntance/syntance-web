import { jsPDF } from 'jspdf'

// Logo Syntance jako JPEG
const LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQIAHAAcAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAHgBaABAREA/8QAHgABAAIDAQEBAQEAAAAAAAAAAAgJBgcKBQQBAwL/xABjEAABAwMDAgIEBA4IEgcIAwAAAQIDBAUGBwgREiEJMRMUQVEiOGF2FRYZIzIzNkJxdYGVs7QYN0RSYpHT1BdTVVZXWGhydIKSlqGmsrXR5CRDc4WTlNIlR2NkhqKxxYOEw//aAAgBAQAAPwC1MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//Z';

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

export function generatePricingPDF(data: PDFData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let y = margin

  // === HEADER ===
  // Logo po lewej
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Syntance', margin, y + 7)
  
  // Dane klienta po prawej
  let clientY = y
  
  if (data.clientName) {
    doc.setFontSize(11)
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFont('helvetica', 'bold')
    doc.text(data.clientName, pageWidth - margin, clientY, { align: 'right' })
    clientY += 5
  }
  
  if (data.clientEmail) {
    doc.setFontSize(9)
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.setFont('helvetica', 'normal')
    doc.text(data.clientEmail, pageWidth - margin, clientY, { align: 'right' })
    clientY += 4
  }
  
  if (data.clientPhone) {
    doc.setFontSize(9)
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.setFont('helvetica', 'normal')
    doc.text(data.clientPhone, pageWidth - margin, clientY, { align: 'right' })
    clientY += 5
  }
  
  // Data
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.setFontSize(8)
  doc.setTextColor(...hexToRgb(COLORS.lightGray))
  doc.text(currentDate, pageWidth - margin, clientY, { align: 'right' })
  
  y += 20

  // === LINIA ODDZIELAJĄCA ===
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  
  y += 10
  
  // === TYTUŁ ===
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('WYCENA PROJEKTU', margin, y)
  
  y += 5
  
  // Typ projektu
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.projectType, margin, y + 5)
  
  y += 15

  // === WYBRANE ELEMENTY (PRZED PODSUMOWANIEM) ===
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Wybrane elementy (${data.items.length})`, margin, y)
  
  y += 8

  // Tabela elementów
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...hexToRgb(COLORS.gray))
  
  // Nagłówki tabeli
  doc.text('Element', margin, y)
  doc.text('Ilość', margin + 100, y)
  doc.text('Cena', margin + 120, y)
  doc.text('Suma', pageWidth - margin, y, { align: 'right' })
  
  y += 3
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  // Elementy
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  data.items.forEach((item) => {
    // Sprawdź czy trzeba nową stronę
    if (y > pageHeight - 60) {
      doc.addPage()
      y = margin
    }
    
    // Nazwa
    doc.setTextColor(...hexToRgb(COLORS.black))
    const itemName = item.required ? `• ${item.name}` : item.name
    doc.text(itemName, margin, y)
    
    // Ilość
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.text(item.quantity.toString(), margin + 100, y)
    
    // Cena jednostkowa
    if (item.hidePrice) {
      doc.text('Indywidualna', margin + 115, y)
    } else if (item.includedInBase) {
      doc.text('W pakiecie', margin + 115, y)
    } else {
      doc.text(`${item.price.toLocaleString('pl-PL')} zł`, margin + 115, y)
    }
    
    // Suma
    if (item.hidePrice) {
      doc.text('—', pageWidth - margin, y, { align: 'right' })
    } else if (item.includedInBase) {
      doc.setTextColor(...hexToRgb(COLORS.purple))
      doc.text('Gratis', pageWidth - margin, y, { align: 'right' })
    } else {
      doc.setTextColor(...hexToRgb(COLORS.black))
      doc.text(`${item.total.toLocaleString('pl-PL')} zł`, pageWidth - margin, y, { align: 'right' })
    }
    
    y += 6
  })
  
  y += 5
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // === PODSUMOWANIE ===
  // Sprawdź czy trzeba nową stronę dla podsumowania
  if (y > pageHeight - 80) {
    doc.addPage()
    y = margin
  }
  
  // Box podsumowania
  const summaryBoxHeight = 55
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, contentWidth, summaryBoxHeight, 3, 3, 'S')
  
  const boxY = y + 10
  const labelX = margin + 10
  const valueX = pageWidth - margin - 10
  const lineHeight = 10
  
  // Cena netto
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Cena netto:', labelX, boxY)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, valueX, boxY, { align: 'right' })
  
  // Cena brutto
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Cena brutto (z VAT):', labelX, boxY + lineHeight)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, valueX, boxY + lineHeight, { align: 'right' })
  
  // Czas realizacji
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Czas realizacji:', labelX, boxY + lineHeight * 2)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni roboczych`, valueX, boxY + lineHeight * 2, { align: 'right' })
  
  // Zaliczka
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Zaliczka (50%):', labelX, boxY + lineHeight * 3)
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, valueX, boxY + lineHeight * 3, { align: 'right' })
  
  y += summaryBoxHeight + 10

  // === LEGENDA ===
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('• Element wymagany', margin, y)

  // === STOPKA ===
  const footerY = pageHeight - 15
  
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.text('Wycena wazna 30 dni', margin, footerY)
  doc.text('kontakt@syntance.com', pageWidth / 2, footerY, { align: 'center' })
  doc.text('syntance.com', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ ===
  const fileName = `Wycena_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
