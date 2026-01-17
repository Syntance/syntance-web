import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Kolory brandingowe Syntance
const COLORS = {
  primary: '#8B5CF6', // fioletowy
  secondary: '#60A5FA', // niebieski
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
}

export interface PDFItem {
  name: string
  quantity: number
  price: number
  total: number
  includedInBase?: boolean
  required?: boolean
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
  'low': 'Niska',
  'medium': 'Średnia',
  'high': 'Wysoka',
  'very-high': 'Bardzo wysoka'
}

export function generatePricingPDF(data: PDFData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  let yPosition = 20

  // === HEADER ===
  // Logo + tytuł (zamiast obrazka, używamy stylizowanego tekstu)
  doc.setFillColor(COLORS.primary)
  doc.roundedRect(15, 15, pageWidth - 30, 35, 3, 3, 'F')
  
  doc.setTextColor(COLORS.white)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('SYNTANCE', pageWidth / 2, 30, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Studio', pageWidth / 2, 40, { align: 'center' })
  
  yPosition = 60

  // === TYTUŁ DOKUMENTU ===
  doc.setTextColor(COLORS.dark)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Wycena projektu', 15, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.gray)
  const currentDate = data.date || new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Data wyceny: ${currentDate}`, 15, yPosition)
  yPosition += 15

  // === INFORMACJE O PROJEKCIE ===
  doc.setFillColor(COLORS.lightGray)
  doc.roundedRect(15, yPosition, pageWidth - 30, 25, 2, 2, 'F')
  
  doc.setTextColor(COLORS.dark)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Typ projektu:', 20, yPosition + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(data.projectType, 20, yPosition + 15)
  
  if (data.projectTypeDescription) {
    doc.setFontSize(9)
    doc.setTextColor(COLORS.gray)
    doc.text(data.projectTypeDescription, 20, yPosition + 20)
  }
  
  yPosition += 35

  // === TABELA ELEMENTÓW ===
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.dark)
  doc.text('Wybrane elementy:', 15, yPosition)
  yPosition += 7

  // Przygotuj dane dla tabeli
  const tableData = data.items.map(item => {
    const priceDisplay = item.includedInBase 
      ? 'W cenie bazowej'
      : `${item.price.toLocaleString('pl-PL')} PLN`
    
    const totalDisplay = item.includedInBase
      ? '—'
      : `${item.total.toLocaleString('pl-PL')} PLN`

    const itemName = item.required 
      ? `${item.name} ★` 
      : item.includedInBase 
        ? `${item.name} ✓` 
        : item.name

    return [
      itemName,
      item.quantity.toString(),
      priceDisplay,
      totalDisplay
    ]
  })

  autoTable(doc, {
    startY: yPosition,
    head: [['Nazwa elementu', 'Ilość', 'Cena jedn.', 'Razem']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.dark,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  })

  // Pobierz pozycję Y po tabeli
  yPosition = (doc as any).lastAutoTable.finalY + 10

  // === INFORMACJE O ZŁOŻONOŚCI ===
  if (data.complexityDays > 0) {
    doc.setFillColor('#FEF3C7') // żółte tło
    doc.roundedRect(15, yPosition, pageWidth - 30, 18, 2, 2, 'F')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.dark)
    doc.text('Dodatek za złożoność:', 20, yPosition + 7)
    
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${complexityLabels[data.complexity]} (+${data.complexityDays} dni, +${data.complexityPrice.toLocaleString('pl-PL')} PLN)`,
      20,
      yPosition + 13
    )
    
    yPosition += 25
  }

  // === PODSUMOWANIE ===
  doc.setFillColor(COLORS.primary)
  doc.roundedRect(15, yPosition, pageWidth - 30, 55, 3, 3, 'F')

  doc.setTextColor(COLORS.white)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Podsumowanie', pageWidth / 2, yPosition + 10, { align: 'center' })

  yPosition += 20

  // Linie z cenami
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const summaryLeft = 25
  const summaryRight = pageWidth - 25

  // Czas realizacji
  doc.text('Czas realizacji:', summaryLeft, yPosition)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.days} dni roboczych (${data.hours}h)`, summaryRight, yPosition, { align: 'right' })
  yPosition += 8

  // Cena netto
  doc.setFont('helvetica', 'normal')
  doc.text('Cena netto:', summaryLeft, yPosition)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.priceNetto.toLocaleString('pl-PL')} PLN`, summaryRight, yPosition, { align: 'right' })
  yPosition += 8

  // VAT
  doc.setFont('helvetica', 'normal')
  doc.text(`VAT (${data.vatRate}%):`, summaryLeft, yPosition)
  doc.setFont('helvetica', 'bold')
  const vatAmount = data.priceBrutto - data.priceNetto
  doc.text(`${vatAmount.toLocaleString('pl-PL')} PLN`, summaryRight, yPosition, { align: 'right' })
  yPosition += 10

  // Linia oddzielająca
  doc.setDrawColor(COLORS.white)
  doc.setLineWidth(0.5)
  doc.line(summaryLeft, yPosition, summaryRight, yPosition)
  yPosition += 6

  // Cena brutto (większa czcionka)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Cena brutto:', summaryLeft, yPosition)
  doc.text(`${data.priceBrutto.toLocaleString('pl-PL')} PLN`, summaryRight, yPosition, { align: 'right' })
  yPosition += 10

  // Zaliczka
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Zaliczka:', summaryLeft, yPosition)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.deposit.toLocaleString('pl-PL')} PLN`, summaryRight, yPosition, { align: 'right' })

  yPosition += 20

  // === STOPKA ===
  const footerY = pageHeight - 25

  doc.setFillColor(COLORS.lightGray)
  doc.rect(0, footerY - 5, pageWidth, 30, 'F')

  doc.setTextColor(COLORS.gray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  doc.text('Syntance Studio', pageWidth / 2, footerY, { align: 'center' })
  doc.text('kontakt@syntance.com | syntance.com', pageWidth / 2, footerY + 5, { align: 'center' })
  
  doc.setFontSize(7)
  doc.text('★ Element wymagany  |  ✓ Gratis w pakiecie', pageWidth / 2, footerY + 10, { align: 'center' })
  doc.text('Wycena ważna 30 dni od daty wystawienia. Ceny mogą ulec zmianie w zależności od szczegółowych wymagań projektu.', pageWidth / 2, footerY + 15, { align: 'center' })

  // === ZAPISZ PDF ===
  const fileName = `Wycena_Syntance_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
