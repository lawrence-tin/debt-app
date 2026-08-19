import { formatCurrency, totalBalance, totalMinPayment, type Debt, type PayoffResult, type Strategy } from './payoff'
import { formatMonthsAsYears, type Translation } from './i18n'

export interface ReportInput {
  debts: Debt[]
  result: PayoffResult
  strategy: Strategy
  currency: string
  locale: string
  t: Translation
}

/** Builds and triggers a download of a one-page PDF summary of the current payoff plan. */
export async function downloadPayoffReportPdf({ debts, result, strategy, currency, locale, t }: ReportInput) {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const autoTable = autoTableModule.default

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(15, 23, 42)
  doc.text(t.report.title, margin, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(t.report.generatedOn(new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })), margin, y)
  y += 14
  doc.text(t.report.strategyUsed(t.strategyName[strategy]), margin, y)
  y += 26

  // Summary stat grid
  const stats: [string, string][] = [
    [t.summary.debtFreeDate, result.feasible ? result.payoffDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '—'],
    [t.summary.totalInterest, result.feasible ? formatCurrency(result.totalInterestPaid, currency, locale) : '—'],
    [t.debts.heading, formatCurrency(totalBalance(debts), currency, locale)],
    [t.budget.requiredMinimums, formatCurrency(totalMinPayment(debts), currency, locale)],
  ]
  const colWidth = (595 - margin * 2) / 2
  stats.forEach(([label, value], i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + col * colWidth
    const rowY = y + row * 36
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(label, x, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text(value, x, rowY + 16)
  })
  y += Math.ceil(stats.length / 2) * 36 + 16

  // Debts table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(t.report.debtsHeading, margin, y)
  y += 10

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [[t.debts.namePlaceholder, t.debts.category, t.debts.balance, t.debts.apr, t.debts.minPayment, t.report.dueDayColumn]],
    body: debts.map((d) => [
      d.name,
      t.category[d.category],
      formatCurrency(d.balance, currency, locale),
      `${d.apr}%`,
      formatCurrency(d.minPayment, currency, locale),
      d.dueDay ? String(d.dueDay) : '—',
    ]),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
  })

  // Payoff order table
  const payoffOrder = [...debts]
    .filter((d) => result.debtPayoffMonth[d.id] !== undefined)
    .sort((a, b) => result.debtPayoffMonth[a.id] - result.debtPayoffMonth[b.id])

  if (payoffOrder.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const afterY = (doc as any).lastAutoTable.finalY + 24
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text(t.report.payoffOrderHeading, margin, afterY)

    autoTable(doc, {
      startY: afterY + 10,
      margin: { left: margin, right: margin },
      head: [['#', t.debts.namePlaceholder, t.strategy.debtFreeIn]],
      body: payoffOrder.map((d, i) => [
        String(i + 1),
        d.name,
        formatMonthsAsYears(result.debtPayoffMonth[d.id], t),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let afterTablesY = (doc as any).lastAutoTable?.finalY ?? y

  // Assumptions — start a fresh page if what's left won't comfortably fit.
  const pageHeight = doc.internal.pageSize.getHeight()
  if (afterTablesY + 160 > pageHeight - margin) {
    doc.addPage()
    afterTablesY = margin
  } else {
    afterTablesY += 24
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text(t.assumptions.heading, margin, afterTablesY)
  afterTablesY += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  for (const item of t.assumptions.items) {
    const lines = doc.splitTextToSize(`•  ${item}`, 595 - margin * 2)
    doc.text(lines, margin, afterTablesY)
    afterTablesY += lines.length * 11 + 3
  }

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(t.report.disclaimer, margin, afterTablesY + 12, { maxWidth: 595 - margin * 2 })

  doc.save('clearpath-debt-report.pdf')
}
