import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Kolory spójne z designem strony Syntance
const COLORS = {
  // Tło
  bgDark: '#05030C',
  bgCard: '#0D0A1A',
  bgAccent: '#1A103D',
  
  // Tekst
  textPrimary: '#F5F3FF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  
  // Akcenty
  brand: '#246BFD',
  purple: '#8A63FF',
  orange: '#FFAA40',
  
  // Gradienty (używamy środkowego koloru dla PDF)
  gradientStart: '#FFAA40',
  gradientEnd: '#9C40FF',
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

// Helper do konwersji hex na RGB
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
  
  // === TŁO STRONY ===
  doc.setFillColor(...hexToRgb(COLORS.bgDark))
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  let y = margin

  // === HEADER Z LOGO ===
  // Accent line na górze
  const gradient = doc.setFillColor(...hexToRgb(COLORS.purple))
  doc.rect(0, 0, pageWidth, 4, 'F')
  
  // Logo area
  doc.setFillColor(...hexToRgb(COLORS.bgCard))
  doc.roundedRect(margin, y + 6, contentWidth, 45, 4, 4, 'F')
  
  // Logo text
  doc.setTextColor(...hexToRgb(COLORS.textPrimary))
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('SYNTANCE', margin + 15, y + 28)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.text('Studio', margin + 15, y + 38)
  
  // Data po prawej
  doc.setFontSize(10)
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(currentDate, pageWidth - margin - 15, y + 28, { align: 'right' })
  doc.text('Wycena projektu', pageWidth - margin - 15, y + 38, { align: 'right' })
  
  y += 60

  // === SEKCJA: TYP PROJEKTU ===
  doc.setFillColor(...hexToRgb(COLORS.bgAccent))
  doc.roundedRect(margin, y, contentWidth, 35, 4, 4, 'F')
  
  // Accent bar
  doc.setFillColor(...hexToRgb(COLORS.orange))
  doc.roundedRect(margin, y, 4, 35, 2, 2, 'F')
  
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('TYP PROJEKTU', margin + 12, y + 12)
  
  doc.setTextColor(...hexToRgb(COLORS.textPrimary))
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.projectType, margin + 12, y + 26)
  
  y += 45

  // === SEKCJA: ELEMENTY PROJEKTU ===
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('WYBRANE ELEMENTY', margin, y)
  y += 8

  // Przygotuj dane dla tabeli
  const tableBody = data.items.map(item => {
    let priceDisplay: string
    let totalDisplay: string
    
    if (item.hidePrice) {
      priceDisplay = 'Indywidualna'
      totalDisplay = '—'
    } else if (item.includedInBase) {
      priceDisplay = 'W pakiecie'
      totalDisplay = 'Gratis'
    } else {
      priceDisplay = `${item.price.toLocaleString('pl-PL')} PLN`
      totalDisplay = `${item.total.toLocaleString('pl-PL')} PLN`
    }

    const badges: string[] = []
    if (item.required) badges.push('★')
    if (item.includedInBase) badges.push('✓')
    
    const itemName = badges.length > 0 
      ? `${badges.join(' ')} ${item.name}`
      : item.name

    return [itemName, item.quantity.toString(), priceDisplay, totalDisplay]
  })

  autoTable(doc, {
    startY: y,
    head: [['Element', 'Ilość', 'Cena jedn.', 'Suma']],
    body: tableBody,
    theme: 'plain',
    styles: {
      fillColor: hexToRgb(COLORS.bgCard),
      textColor: hexToRgb(COLORS.textPrimary),
      fontSize: 9,
      cellPadding: 6,
      lineColor: hexToRgb(COLORS.bgAccent),
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: hexToRgb(COLORS.bgAccent),
      textColor: hexToRgb(COLORS.textSecondary),
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 8,
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.bgDark),
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    tableLineColor: hexToRgb(COLORS.bgAccent),
    tableLineWidth: 0.5,
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // === SEKCJA: ZŁOŻONOŚĆ (jeśli dotyczy) ===
  if (data.complexityDays > 0) {
    doc.setFillColor(...hexToRgb(COLORS.bgCard))
    doc.roundedRect(margin, y, contentWidth, 25, 4, 4, 'F')
    
    // Purple accent
    doc.setFillColor(...hexToRgb(COLORS.purple))
    doc.roundedRect(margin, y, 4, 25, 2, 2, 'F')
    
    doc.setTextColor(...hexToRgb(COLORS.textSecondary))
    doc.setFontSize(9)
    doc.text('DODATEK ZA ZŁOŻONOŚĆ', margin + 12, y + 10)
    
    doc.setTextColor(...hexToRgb(COLORS.textPrimary))
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `${complexityLabels[data.complexity]} • +${data.complexityDays} dni • +${data.complexityPrice.toLocaleString('pl-PL')} PLN`,
      margin + 12,
      y + 18
    )
    
    y += 35
  }

  // === SEKCJA: PODSUMOWANIE ===
  // Box główny
  doc.setFillColor(...hexToRgb(COLORS.bgAccent))
  doc.roundedRect(margin, y, contentWidth, 85, 6, 6, 'F')
  
  // Gradient accent na górze boxa
  doc.setFillColor(...hexToRgb(COLORS.purple))
  doc.roundedRect(margin, y, contentWidth, 6, 6, 6, 'F')
  doc.setFillColor(...hexToRgb(COLORS.bgAccent))
  doc.rect(margin, y + 3, contentWidth, 3, 'F')
  
  const summaryY = y + 20
  const col1 = margin + 15
  const col2 = pageWidth / 2 + 10
  
  // Lewa kolumna - szczegóły
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  doc.text('CZAS REALIZACJI', col1, summaryY)
  doc.setTextColor(...hexToRgb(COLORS.textPrimary))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni roboczych`, col1, summaryY + 10)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.text(`(${data.hours} godzin pracy)`, col1, summaryY + 18)
  
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(9)
  doc.text('ZALICZKA', col1, summaryY + 35)
  doc.setTextColor(...hexToRgb(COLORS.orange))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, col1, summaryY + 45)
  
  // Prawa kolumna - ceny
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('CENA NETTO', col2, summaryY)
  doc.setTextColor(...hexToRgb(COLORS.textPrimary))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 10)
  
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`VAT (${data.vatRate}%)`, col2, summaryY + 22)
  doc.setTextColor(...hexToRgb(COLORS.textMuted))
  doc.setFontSize(11)
  doc.text(`+${(data.priceBrutto - data.priceNetto).toLocaleString('pl-PL')} PLN`, col2, summaryY + 30)
  
  // Cena brutto - główna
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('CENA BRUTTO', col2, summaryY + 45)
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, col2, summaryY + 58)
  
  y += 95

  // === STOPKA ===
  const footerY = pageHeight - 35
  
  // Linia oddzielająca
  doc.setDrawColor(...hexToRgb(COLORS.bgAccent))
  doc.setLineWidth(0.5)
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10)
  
  // Legenda
  doc.setTextColor(...hexToRgb(COLORS.textMuted))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('★ Element wymagany   ✓ W cenie pakietu', margin, footerY)
  
  // Kontakt
  doc.setTextColor(...hexToRgb(COLORS.textSecondary))
  doc.text('kontakt@syntance.com', pageWidth / 2, footerY, { align: 'center' })
  doc.text('syntance.com', pageWidth / 2, footerY + 6, { align: 'center' })
  
  // Ważność
  doc.setTextColor(...hexToRgb(COLORS.textMuted))
  doc.setFontSize(7)
  doc.text('Wycena ważna 30 dni. Szczegóły ustalane indywidualnie.', pageWidth - margin, footerY, { align: 'right' })
  
  // Accent line na dole
  doc.setFillColor(...hexToRgb(COLORS.purple))
  doc.rect(0, pageHeight - 4, pageWidth, 4, 'F')

  // === ZAPISZ PDF ===
  const fileName = `Wycena_Syntance_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
