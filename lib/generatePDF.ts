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
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Syntance', margin, y + 6)
  
  // Dane klienta po prawej (jeśli są)
  const rightX = pageWidth - margin
  let clientY = y
  
  if (data.clientName) {
    doc.setFontSize(12)
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFont('helvetica', 'bold')
    doc.text(data.clientName, rightX, clientY, { align: 'right' })
    clientY += 6
  }
  
  if (data.clientEmail) {
    doc.setFontSize(10)
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.setFont('helvetica', 'normal')
    doc.text(data.clientEmail, rightX, clientY, { align: 'right' })
    clientY += 5
  }
  
  if (data.clientPhone) {
    doc.setFontSize(10)
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.setFont('helvetica', 'normal')
    doc.text(data.clientPhone, rightX, clientY, { align: 'right' })
    clientY += 5
  }
  
  // Data (zawsze wyświetlana)
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.setFontSize(9)
  doc.setTextColor(...hexToRgb(COLORS.lightGray))
  doc.text(currentDate, rightX, clientY, { align: 'right' })
  
  y += 18

  // === LINIA ODDZIELAJĄCA ===
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  
  y += 12
  
  // === TYTUŁ ===
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('WYCENA PROJEKTU', margin, y)
  
  y += 8
  
  // Typ projektu
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(data.projectType, margin, y)
  
  y += 15

  // === WYBRANE ELEMENTY ===
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Wybrane elementy (${data.items.length})`, margin, y)
  
  y += 8

  // Nagłówki tabeli
  const col1 = margin  // Element
  const col2 = margin + 90  // Ilość
  const col3 = margin + 110  // Cena
  const col4 = pageWidth - margin  // Suma (wyrównanie do prawej)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.text('Element', col1, y)
  doc.text('Ilość', col2, y)
  doc.text('Cena', col3, y)
  doc.text('Suma', col4, y, { align: 'right' })
  
  y += 4
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // Elementy
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  data.items.forEach((item) => {
    // Nowa strona jeśli brakuje miejsca
    if (y > pageHeight - 70) {
      doc.addPage()
      y = margin
    }
    
    // Nazwa elementu (z oznaczeniem jeśli wymagany)
    doc.setTextColor(...hexToRgb(COLORS.black))
    const displayName = item.required ? `• ${item.name}` : item.name
    
    // Skróć nazwę jeśli za długa
    let itemName = displayName
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
    
    // Cena jednostkowa
    if (item.hidePrice) {
      doc.text('Indywidualna', col3, y)
    } else if (item.includedInBase) {
      doc.text('W cenie', col3, y)
    } else {
      doc.text(`${item.price.toLocaleString('pl-PL')} zl`, col3, y)
    }
    
    // Suma
    if (item.hidePrice) {
      doc.text('-', col4, y, { align: 'right' })
    } else if (item.includedInBase) {
      doc.setTextColor(...hexToRgb(COLORS.purple))
      doc.text('Gratis', col4, y, { align: 'right' })
    } else {
      doc.setTextColor(...hexToRgb(COLORS.black))
      doc.text(`${item.total.toLocaleString('pl-PL')} zl`, col4, y, { align: 'right' })
    }
    
    y += 7
  })
  
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
