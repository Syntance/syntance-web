import { jsPDF } from 'jspdf'

// Logo Syntance jako bardzo mały JPEG (format który lepiej działa z jsPDF)
// Jeśli to nie zadziała, użyjemy tekstu
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABQCAYAAACj6kh7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZWRhMmIzZmFjLCAyMDIxLzExLzE3LTE3OjIzOjE5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTAxLTE3VDEyOjAwOjAwKzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wMS0xN1QxMjowMDowMCswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wMS0xN1QxMjowMDowMCswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiBzdEV2dDp3aGVuPSIyMDI2LTAxLTE3VDEyOjAwOjAwKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjMuMSAoV2luZG93cykiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAALswPvwAADHtJREFUeNrtnXl0VNUdx+/MZJJMQhYSQiAkYQlL2EQQBBVQQFFRcQMXrFar1tZqa7Wt1p7aU3u0tra11WrtaV2r1gUVFRdEQFYBkX0JOwkJSchC9mW27/njvrlz586bN5OZTCbhfs+Zc+a9++6y5H7m/n73/n7PIgCwkIUsFPq/4q4tl8vlsrpcLlfQ5nLZ7Xa73W6323HNhtHmeDjFxMTExMQ4OxyODofDgc+GDgf+nEAQ1kAQNjIYDMbAwMDAQJvNZrPZrFarNUCSpAWCIMRfTxD+X48OX6xCIIhgSZKcEokk1C6XS4JBAJIkCX/9/AwKDQ0NDw0NZU9MTExMREREBIJD3EB9vl5JRBSpOC9Jkhx9DYJwOHT/rvQT+Hu8f8d5COIeJUmSFKlQKERxcXEJkZGRke7O8HfFxcfFxyfExCQkJCYmJrrfJzY2NjY2LCwsLCwsNPRGodZ7CgA8Ewi4u1fh8ZSkUqkoRlEqFYrS0tLSsrKyslu3bt1aWlp6M64RBDFJEISfIAi7IAgHfL5t23bs2L59+3Zc27Zt27Zt23Zt26ZN27ZpE9dsmzZtmjRp0qRp06ZNmzZp0qRJ06ZNm+LapEkT+pqQkJDYhISExOTkO++MiYmNjY2Ji4+Pj4tPTExKTEpOTk6+4447brjhhiuuuOKKa665Ztq0adOmTp06bdq0KVOmTJkyderUqVOnXnvttddec83VV199xRVXXH755dOmTZ8+ffr06TNmzJg5c+aMGdOnT58+Y8b06TNmzLjuumuvve6666677rrrrrvuuuuuv/76G264Yfr06TNmTJt27bXXXH311VdfddVVV151xRVXXHH55ZddNm3atKlTp06dMmXKlCmTJ0+aOHHihAkTxo8fP27smDGjR40aNWr48OHDhw8bNnTo0CGDBw8eOGjQwAH9+/Xr17dv3z59evfu3atnz57de/To0a1bt65dunTp0qVzl86dOnXu1KlTx04dO3bo0KF9+/bt2rVr27Zt29atW7dq1apVy5YtW7Zo0aJ5ixbNmzdv1rRp06ZNmzRu3Lhx48aNGjVs2LBhwwYNGtSvX79e3Xr1+vfv379vv379+vXt27dfv37/3/B1uH+/+vW//rr+/a9f/6uvrlu37tdffbV+/Xrr16+35ppffvnFF59/PnPmjBnTp0+bNm3atGnXXnvtNddcc83V11x99VVXXXXVVV9+9dVXX32tW/frr7/++mv6a/26/vp169eta9WqVeuWLVu2atWqZcuWLVq2bNmyRcuWLVq0aNGiRYvmzZs3b968efPmTZo0adKkSeMmTRo3bty4caNGjRo2atiwQYOGDRs0qF+vXr269erVq1uvXt26devWrVe3bte6db+6+ppr6tarW7de3bp169WrV69evXp1S0tLS0tLy8vLy8rLy8vLy8rKysrKSkpKSopLSopLSopLSouLS0pKSkqKi4uKioqKi4oKCwsL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';

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

  // === HEADER - Logo + Data ===
  // Próba dodania logo jako obrazek
  let logoAdded = false
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, y - 5, 55, 18)
    logoAdded = true
  } catch (e) {
    // Jeśli logo nie zadziała, użyj tekstu
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Syntance', margin, y + 9)
  }
  
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
  doc.setFontSize(14)
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
  doc.roundedRect(margin, y, contentWidth, 78, 3, 3, 'S')
  
  const boxY = y + 12
  const labelX = margin + 12
  const valueX = pageWidth - margin - 12
  
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Podsumowanie wyceny:', labelX, boxY)
  
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
  
  y += 93

  // === WYBRANE ELEMENTY ===
  const elementsBoxHeight = 20 + data.items.length * 10
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.roundedRect(margin, y, contentWidth, elementsBoxHeight, 3, 3, 'S')
  
  const elementsY = y + 12
  
  doc.setTextColor(...hexToRgb(COLORS.black))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Wybrane elementy (${data.items.length}):`, labelX, elementsY)
  
  // Lista elementów
  let itemY = elementsY + 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  data.items.forEach((item) => {
    // Kropka
    doc.setFillColor(...hexToRgb(COLORS.purple))
    doc.circle(labelX - 3, itemY - 1.2, 1.5, 'F')
    
    // Nazwa elementu
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.text(item.name, labelX + 3, itemY)
    
    itemY += 10
  })
  
  y = y + elementsBoxHeight + 15

  // === STOPKA ===
  const footerY = pageHeight - 20
  
  doc.setDrawColor(...hexToRgb(COLORS.border))
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)
  
  doc.setTextColor(...hexToRgb(COLORS.gray))
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Wycena wazna 30 dni od daty wystawienia', margin, footerY)
  doc.text('kontakt@syntance.com', pageWidth / 2, footerY, { align: 'center' })
  doc.text('syntance.com', pageWidth - margin, footerY, { align: 'right' })

  // === ZAPISZ PDF ===
  const fileName = `Wycena_${data.projectType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
