import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Kolory - eleganckie, minimalistyczne
const COLORS = {
  white: '#FFFFFF',
  black: '#111111',
  darkGray: '#374151',
  gray: '#6B7280',
  lightGray: '#F9FAFB',
  border: '#E5E7EB',
  accent: '#1F2937',
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
  const margin = 25
  const contentWidth = pageWidth - (margin * 2)
  
  let y = margin

  // === HEADER ===
  // Sygnet stylizowany (okrąg z S)
  doc.setFillColor(...hexToRgb(COLORS.black))
  doc.circle(margin + 5, y + 5, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('S', margin + 3.3, y + 7)
  
  // Nazwa firmy
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Syntance', margin + 14, y + 7.5)
  
  // Data po prawej
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.setFontSize(10)
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text(currentDate, pageWidth - margin, y + 7.5, { align: 'right' })
  
  y += 20

  // === TYTUŁ DOKUMENTU ===
  doc.setFillColor(...hexToRgb(COLORS.lightGray))
  doc.rect(margin, y, contentWidth, 28, 'F')
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('WYCENA PROJEKTU', margin + 10, y + 10)
  
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.projectType, margin + 10, y + 21)
  
  y += 38

  // === TABELA ELEMENTÓW ===
  doc.setTextColor(...hexToRgb(COLORS.darkGray))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Szczegóły wyceny', margin, y)
  y += 8

  const tableBody = data.items.map(item => {
    let priceDisplay: string
    let totalDisplay: string
    
    if (item.hidePrice) {
      priceDisplay = 'Indywidualnie'
      totalDisplay = '—'
    } else if (item.includedInBase) {
      priceDisplay = 'W pakiecie'
      totalDisplay = '0 PLN'
    } else {
      priceDisplay = `${item.price.toLocaleString('pl-PL')} PLN`
      totalDisplay = `${item.total.toLocaleString('pl-PL')} PLN`
    }

    let itemName = item.name
    if (item.required) itemName = `◆ ${itemName}`

    return [itemName, item.quantity.toString(), priceDisplay, totalDisplay]
  })

  autoTable(doc, {
    startY: y,
    head: [['Usługa / Element', 'Ilość', 'Cena jedn.', 'Wartość']],
    body: tableBody,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: hexToRgb(COLORS.darkGray),
      lineColor: hexToRgb(COLORS.border),
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: hexToRgb(COLORS.white),
      textColor: hexToRgb(COLORS.gray),
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 5,
    },
    bodyStyles: {
      fillColor: hexToRgb(COLORS.white),
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: hexToRgb(COLORS.black) },
    },
    margin: { left: margin, right: margin },
    tableLineColor: hexToRgb(COLORS.border),
    tableLineWidth: 0.2,
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // === ZŁOŻONOŚĆ (jeśli dotyczy) ===
  if (data.complexityDays > 0) {
    doc.setDrawColor(...hexToRgb(COLORS.border))
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
    
    doc.setTextColor(...hexToRgb(COLORS.gray))
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Dodatek za złożoność projektu:', margin, y + 4)
    
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `${complexityLabels[data.complexity]} (+${data.complexityDays} dni, +${data.complexityPrice.toLocaleString('pl-PL')} PLN)`,
      pageWidth - margin,
      y + 4,
      { align: 'right' }
    )
    
    y += 12
  }

  // === PODSUMOWANIE ===
  y += 5
  
  // Ramka podsumowania
  doc.setFillColor(...hexToRgb(COLORS.accent))
  doc.roundedRect(margin, y, contentWidth, 55, 2, 2, 'F')
  
  const summaryY = y + 12
  const col1 = margin + 15
  const col2 = pageWidth / 2 + 10
  
  // Lewa kolumna - czas i zaliczka
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('CZAS REALIZACJI', col1, summaryY)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni`, col1, summaryY + 10)
  
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('ZALICZKA (50%)', col1, summaryY + 25)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, col1, summaryY + 34)
  
  // Prawa kolumna - ceny
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('NETTO', col2, summaryY)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 8)
  
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.text(`+ VAT ${data.vatRate}%`, col2, summaryY + 17)
  
  // Cena brutto - główna, wyróżniona
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.text('DO ZAPŁATY', col2, summaryY + 28)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 40)
  
  y += 65

  // === STOPKA ===
  const footerY = pageHeight - 20
  
  // Linia
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)
  
  // Legenda i info
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('◆ Element wymagany', margin, footerY)
  doc.text('Wycena ważna 30 dni', pageWidth / 2, footerY, { align: 'center' })
  doc.text('syntance.com', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ PDF ===
  const fileName = `Wycena_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
