// Pomocni kod za pravljenje PDF-a (exportSprayingHistoryPdf).

import type { SprayingAnnouncementDto } from '../api/apiClient';
import {
  addReportFooters,
  addReportHeader,
  drawStatCard,
  hasPageSpace,
  PDF_COLORS,
  PDF_LAYOUT,
  sanitizePdfFileName,
  toPdfText,
} from './pdfReport';

export async function exportSprayingHistoryPdf(
  parcelName: string,
  treatments: SprayingAnnouncementDto[],
  fromDate?: string,
  toDate?: string,
) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = PDF_LAYOUT.margin;
  const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const cardGap = 4;
  const statCardWidth = (contentWidth - cardGap) / 2;
  const reportTitle = 'Digitalni karton prskanja';
  const reportSubtitle = `Parcela: ${toPdfText(parcelName)}`;
  let cursorY = addReportHeader(pdf, reportTitle, reportSubtitle, 'Evidencija tretmana');

  drawStatCard(pdf, margin, cursorY, statCardWidth, 'Parcela', parcelName);
  drawStatCard(
    pdf,
    margin + statCardWidth + cardGap,
    cursorY,
    statCardWidth,
    'Farmer',
    formatText(treatments[0]?.farmerName),
  );
  cursorY += 22;
  drawStatCard(pdf, margin, cursorY, statCardWidth, 'Period', formatPeriod(fromDate, toDate));
  drawStatCard(
    pdf,
    margin + statCardWidth + cardGap,
    cursorY,
    statCardWidth,
    'Zavrseni tretmani',
    String(treatments.length),
  );
  cursorY += 27;

  pdf.setTextColor(...PDF_COLORS.text);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Pregled zavrsenih tretmana', margin, cursorY);
  pdf.setDrawColor(...PDF_COLORS.honey);
  pdf.setLineWidth(0.8);
  pdf.line(margin, cursorY + 3, margin + 24, cursorY + 3);
  cursorY += 9;

  treatments.forEach((treatment, index) => {
    const rows = [
      ['Kultura', formatText(treatment.cropName)],
      ['Stvarni pocetak', formatDateTime(treatment.actualStartTime)],
      ['Stvarni kraj', formatDateTime(treatment.actualEndTime)],
      ['Status', formatText(treatment.status)],
      ['Vremenski uslovi', formatWeather(treatment)],
      ['Napomena', formatText(treatment.note)],
    ];
    const title = formatText(treatment.preparationType);
    const rowMeasurements = rows.map(([, value]) =>
      pdf.splitTextToSize(toPdfText(value), contentWidth - 54),
    );
    const titleLines = pdf.splitTextToSize(toPdfText(title), contentWidth - 23);
    const cardHeight = 15
      + titleLines.length * 4.5
      + rowMeasurements.reduce((height, lines) => height + Math.max(6, lines.length * 4), 0);

    if (!hasPageSpace(pdf, cursorY, cardHeight + 4)) {
      pdf.addPage();
      cursorY = addReportHeader(
        pdf,
        reportTitle,
        `${reportSubtitle} - nastavak`,
        'Evidencija tretmana',
      );
    }

    pdf.setFillColor(...PDF_COLORS.white);
    pdf.setDrawColor(...PDF_COLORS.border);
    pdf.roundedRect(margin, cursorY, contentWidth, cardHeight, 2.5, 2.5, 'FD');

    pdf.setFillColor(...PDF_COLORS.green);
    pdf.roundedRect(margin, cursorY, 8, cardHeight, 2.5, 2.5, 'F');

    pdf.setTextColor(...PDF_COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(String(index + 1), margin + 4, cursorY + 8, { align: 'center' });

    let rowY = cursorY + 7;
    pdf.setTextColor(...PDF_COLORS.text);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(titleLines, margin + 13, rowY);
    rowY += titleLines.length * 4.5 + 4;

    rows.forEach(([label, value], rowIndex) => {
      const valueLines = rowMeasurements[rowIndex];

      pdf.setTextColor(...PDF_COLORS.mutedText);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(toPdfText(label).toUpperCase(), margin + 13, rowY);

      pdf.setTextColor(...PDF_COLORS.text);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(valueLines, margin + 50, rowY);
      rowY += Math.max(6, valueLines.length * 4);
    });

    cursorY += cardHeight + 4;
  });

  addReportFooters(pdf);
  pdf.save(`karton-prskanja-${sanitizePdfFileName(parcelName)}.pdf`);
}

function formatWeather(treatment: SprayingAnnouncementDto) {
  const weather = treatment.weatherSnapshot;

  if (!weather) {
    return 'Nema dostupnih podataka';
  }

  const description = formatText(weather.description);
  const rain = weather.hasRain ? 'da' : 'ne';
  return `${description}; vjetar ${weather.windSpeed.toFixed(1)} m/s; kisa ${rain}`;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? toPdfText(value) : date.toLocaleString('sr-Latn-BA');
}

function formatPeriod(fromDate?: string, toDate?: string) {
  if (!fromDate && !toDate) {
    return 'Svi zapisi';
  }

  return `${fromDate || 'pocetak'} - ${toDate || 'danas'}`;
}

function formatText(value?: string | null) {
  return toPdfText(value);
}
