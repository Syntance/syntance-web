import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Kolory - czyste, minimalistyczne
const COLORS = {
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  purple: '#8B5CF6',
  blue: '#3B82F6',
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

// Logo jako ścieżka SVG - sygnet Syntance (uproszczony)
function drawLogo(doc: jsPDF, x: number, y: number, size: number) {
  const scale = size / 120
  
  // Czarny okrąg
  doc.setFillColor(...hexToRgb(COLORS.black))
  doc.circle(x + 60 * scale, y + 60 * scale, 50 * scale, 'F')
  
  // Litera S w środku
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(48 * scale)
  doc.setFont('helvetica', 'bold')
  doc.text('S', x + 60 * scale, y + 75 * scale, { align: 'center' })
}

export function generatePricingPDF(data: PDFData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let y = margin

  // === HEADER ===
  // Logo (sygnet)
  drawLogo(doc, margin, y - 5, 35)
  
  // Tekst "Syntance Studio" obok sygnetu
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Syntance', margin + 42, y + 10)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.text('Studio', margin + 42, y + 18)
  
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
  
  y += 40

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
  doc.setDrawColor(...hexToRgb(COLORS.purple))
  doc.setLineWidth(1)
  doc.roundedRect(margin, y, contentWidth, 70, 3, 3, 'S')
  
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
  doc.text('ZALICZKA DO ZAPŁATY', col1, summaryY + 30)
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, col1, summaryY + 38)
  
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
  doc.text('CENA BRUTTO', col2, summaryY + 35)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 46)
  
  y += 80

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
