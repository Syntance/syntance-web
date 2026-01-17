import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Kolory
const COLORS = {
  white: '#FFFFFF',
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
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

// Funkcja do rysowania sygnetu Syntance
function drawSygnet(doc: jsPDF, x: number, y: number, size: number) {
  const scale = size / 240 // 240 to oryginalna wysokość sygnetu w SVG
  
  doc.setFillColor(0, 0, 0)
  
  // Górny równoległobok (lewa część S)
  const upper = [
    [271, 120], [308, 123], [176, 255], [186, 265], [271, 180],
    [356, 175], [351, 260], [271, 340], [221, 360], [186, 357],
    [316, 225], [316, 215], [221, 300], [176, 345], [136, 305],
    [141, 220], [221, 140]
  ].map(([px, py]) => [x + (px - 96) * scale, y + (py - 120) * scale])
  
  // Uproszczony sygnet - dwa przecinające się równoległoboki
  // Górny lewy -> dolny prawy
  doc.setFillColor(0, 0, 0)
  
  // Kształt 1 (górny-lewy do środka)
  const x1 = x
  const y1 = y
  const w = size * 0.9
  const h = size
  
  // Pierwszy równoległobok
  doc.triangle(x1 + w * 0.65, y1, x1 + w, y1 + h * 0.23, x1 + w * 0.35, y1 + h * 0.6, 'F')
  doc.triangle(x1 + w * 0.65, y1, x1 + w * 0.35, y1 + h * 0.6, x1 + w * 0.18, y1 + h * 0.42, 'F')
  doc.triangle(x1 + w * 0.65, y1, x1 + w * 0.18, y1 + h * 0.42, x1 + w * 0.48, y1 + h * 0.08, 'F')
  
  // Drugi równoległobok
  doc.triangle(x1 + w * 0.35, y1 + h, x1, y1 + h * 0.77, x1 + w * 0.65, y1 + h * 0.4, 'F')
  doc.triangle(x1 + w * 0.35, y1 + h, x1 + w * 0.65, y1 + h * 0.4, x1 + w * 0.82, y1 + h * 0.58, 'F')
  doc.triangle(x1 + w * 0.35, y1 + h, x1 + w * 0.82, y1 + h * 0.58, x1 + w * 0.52, y1 + h * 0.92, 'F')
}

export function generatePricingPDF(data: PDFData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 25
  const contentWidth = pageWidth - (margin * 2)
  
  let y = margin

  // === HEADER - Logo + Data ===
  // Sygnet
  drawSygnet(doc, margin, y - 2, 14)
  
  // Tekst "Syntance"
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Syntance', margin + 18, y + 9)
  
  // Data po prawej
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.setFontSize(11)
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text(currentDate, pageWidth - margin, y + 9, { align: 'right' })
  
  y += 35

  // === TYTUŁ - WYCENA PROJEKTU ===
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  
  y += 15
  
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('WYCENA PROJEKTU', pageWidth / 2, y, { align: 'center' })
  
  y += 15
  
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.line(margin, y, pageWidth - margin, y)
  
  y += 15

  // === TYP PROJEKTU ===
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('TYP PROJEKTU', margin, y)
  
  y += 7
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.projectType, margin, y)
  
  y += 20

  // === PODSUMOWANIE WYCENY ===
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, contentWidth, 75, 3, 3, 'S')
  
  const boxY = y + 12
  const labelX = margin + 15
  const valueX = pageWidth - margin - 15
  
  // Emoji/ikona
  doc.setFontSize(12)
  doc.text('📋', margin + 8, boxY)
  
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Podsumowanie wyceny:', margin + 18, boxY)
  
  // Wiersze podsumowania
  const summaryY = boxY + 15
  const lineHeight = 12
  
  // Typ projektu
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Typ projektu:', labelX, summaryY)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(data.projectType, valueX, summaryY, { align: 'right' })
  
  // Cena netto
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Cena netto:', labelX, summaryY + lineHeight)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, valueX, summaryY + lineHeight, { align: 'right' })
  
  // Cena brutto
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Cena brutto:', labelX, summaryY + lineHeight * 2)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, valueX, summaryY + lineHeight * 2, { align: 'right' })
  
  // Czas realizacji
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Czas realizacji:', labelX, summaryY + lineHeight * 3)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni roboczych`, valueX, summaryY + lineHeight * 3, { align: 'right' })
  
  // Zaliczka
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFont('helvetica', 'normal')
  doc.text('Zaliczka:', labelX, summaryY + lineHeight * 4)
  doc.setTextColor(...hexToRgb(COLORS.purple))
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, valueX, summaryY + lineHeight * 4, { align: 'right' })
  
  y += 90

  // === WYBRANE ELEMENTY ===
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.roundedRect(margin, y, contentWidth, 20 + data.items.length * 10, 3, 3, 'S')
  
  const elementsY = y + 12
  
  // Emoji/ikona
  doc.setFontSize(12)
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.text('📦', margin + 8, elementsY)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Wybrane elementy (${data.items.length}):`, margin + 18, elementsY)
  
  // Lista elementów
  let itemY = elementsY + 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  data.items.forEach((item) => {
    // Kropka
    doc.setFillColor(...hexToRgb(COLORS.purple))
    doc.circle(labelX - 5, itemY - 1.5, 1.5, 'F')
    
    // Nazwa elementu
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.text(item.name, labelX, itemY)
    
    itemY += 10
  })
  
  y = itemY + 15

  // === STOPKA ===
  const footerY = pageHeight - 20
  
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Wycena ważna 30 dni od daty wystawienia', margin, footerY)
  doc.text('kontakt@syntance.com', pageWidth / 2, footerY, { align: 'center' })
  doc.text('syntance.com', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ PDF ===
  const fileName = `Wycena_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
