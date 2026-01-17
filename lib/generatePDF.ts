import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Logo Syntance (Sygnet + tekst) w czerni - base64
const LOGO_BASE64 = 'data:image/png;base64,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';

// Kolory - czyste, minimalistyczne
const COLORS = {
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
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
}

const complexityLabels = {
  'low': 'Standardowa',
  'medium': 'Średnia',
  'high': 'Wysoka',
  'very-high': 'Bardzo wysoka'
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

  // === HEADER Z LOGO ===
  // Logo tekstowe "SYNTANCE Studio"
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SYNTANCE', margin, y + 8)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.text('Studio', margin, y + 14)
  
  // Data i numer wyceny po prawej
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.setFontSize(10)
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.text('WYCENA PROJEKTU', pageWidth - margin, y + 5, { align: 'right' })
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(11)
  doc.text(currentDate, pageWidth - margin, y + 12, { align: 'right' })
  
  y += 30

  // Linia oddzielająca
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  
  y += 15

  // === TYP PROJEKTU ===
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('TYP PROJEKTU', margin, y)
  
  y += 6
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.projectType, margin, y)
  
  y += 15

  // === TABELA ELEMENTÓW ===
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('WYBRANE ELEMENTY', margin, y)
  y += 5

  const tableBody = data.items.map(item => {
    let priceDisplay: string
    let totalDisplay: string
    
    if (item.hidePrice) {
      priceDisplay = 'Wycena indywidualna'
      totalDisplay = '—'
    } else if (item.includedInBase) {
      priceDisplay = 'W pakiecie'
      totalDisplay = 'Gratis'
    } else {
      priceDisplay = `${item.price.toLocaleString('pl-PL')} PLN`
      totalDisplay = `${item.total.toLocaleString('pl-PL')} PLN`
    }

    let itemName = item.name
    if (item.required) itemName = `● ${itemName}`

    return [itemName, item.quantity.toString(), priceDisplay, totalDisplay]
  })

  autoTable(doc, {
    startY: y,
    head: [['Element', 'Ilość', 'Cena jedn.', 'Suma']],
    body: tableBody,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: hexToRgb(COLORS.black),
      lineColor: hexToRgb(COLORS.border),
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: hexToRgb(COLORS.lightGray),
      textColor: hexToRgb(COLORS.gray),
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 6,
    },
    bodyStyles: {
      fillColor: hexToRgb(COLORS.white),
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // === ZŁOŻONOŚĆ (jeśli dotyczy) ===
  if (data.complexityDays > 0) {
    doc.setFillColor(...hexToRgb(COLORS.lightGray))
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F')
    
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.setFontSize(8)
    doc.text('DODATEK ZA ZŁOŻONOŚĆ', margin + 8, y + 7)
    
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `${complexityLabels[data.complexity]} (+${data.complexityDays} dni, +${data.complexityPrice.toLocaleString('pl-PL')} PLN)`,
      margin + 8,
      y + 13
    )
    doc.setFont('helvetica', 'normal')
    
    y += 25
  }

  // === PODSUMOWANIE ===
  y += 5
  
  // Box podsumowania
  doc.setDrawColor(...hexToRgb(COLORS.black))
  doc.setLineWidth(1)
  doc.roundedRect(margin, y, contentWidth, 65, 3, 3, 'S')
  
  const summaryY = y + 12
  const col1 = margin + 12
  const col2 = pageWidth / 2 + 15
  
  // Lewa kolumna
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.text('CZAS REALIZACJI', col1, summaryY)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni roboczych`, col1, summaryY + 8)
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('ZALICZKA DO ZAPŁATY', col1, summaryY + 25)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, col1, summaryY + 33)
  
  // Prawa kolumna
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('CENA NETTO', col2, summaryY)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(12)
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 7)
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.text(`VAT ${data.vatRate}%`, col2, summaryY + 16)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(10)
  doc.text(`+${(data.priceBrutto - data.priceNetto).toLocaleString('pl-PL')} PLN`, col2, summaryY + 22)
  
  // Cena brutto - główna, wyróżniona
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.text('CENA BRUTTO', col2, summaryY + 32)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 43)
  
  y += 75

  // === STOPKA ===
  const footerY = pageHeight - 25
  
  // Linia
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)
  
  // Legenda
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('● Element wymagany', margin, footerY)
  
  // Kontakt
  doc.text('kontakt@syntance.com  •  syntance.com', pageWidth / 2, footerY, { align: 'center' })
  
  // Ważność
  doc.setFontSize(7)
  doc.text('Wycena ważna 30 dni od daty wystawienia', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ PDF ===
  const fileName = `Wycena_Syntance_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
