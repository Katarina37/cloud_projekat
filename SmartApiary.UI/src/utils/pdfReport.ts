// Pomocni kod za pravljenje PDF-a (pdfReport).

import type { jsPDF } from 'jspdf';

type PdfColor = [number, number, number];

export const PDF_COLORS = {
  primary: [29, 30, 34] as PdfColor,
  green: [45, 94, 72] as PdfColor,
  honey: [249, 160, 27] as PdfColor,
  text: [35, 39, 42] as PdfColor,
  mutedText: [102, 112, 108] as PdfColor,
  surface: [247, 249, 247] as PdfColor,
  white: [255, 255, 255] as PdfColor,
  border: [221, 226, 222] as PdfColor,
  successSurface: [229, 242, 234] as PdfColor,
  successText: [35, 103, 66] as PdfColor,
  warningSurface: [255, 242, 214] as PdfColor,
  warningText: [142, 88, 6] as PdfColor,
};

export const PDF_LAYOUT = {
  margin: 14,
  footerSpace: 14,
};

export function addReportHeader(
  pdf: jsPDF,
  title: string,
  subtitle: string,
  reportLabel: string,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = PDF_LAYOUT.margin;

  pdf.setFillColor(...PDF_COLORS.primary);
  pdf.rect(0, 0, pageWidth, 31, 'F');

  pdf.setFillColor(...PDF_COLORS.honey);
  pdf.roundedRect(margin, 8, 3, 15, 1.5, 1.5, 'F');

  pdf.setTextColor(...PDF_COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(fitTextLine(pdf, title, pageWidth - margin * 2 - 67), margin + 7, 15);

  pdf.setTextColor(213, 219, 216);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(fitTextLine(pdf, subtitle, pageWidth - margin * 2 - 67), margin + 7, 21);

  pdf.setTextColor(...PDF_COLORS.honey);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('SMART APIARY', pageWidth - margin, 13, { align: 'right' });

  pdf.setTextColor(213, 219, 216);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text(toPdfText(reportLabel).toUpperCase(), pageWidth - margin, 18, { align: 'right' });

  return 39;
}

export function drawStatCard(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
) {
  const height = 18;
  const valueLines = pdf.splitTextToSize(toPdfText(value), width - 8).slice(0, 2);

  pdf.setFillColor(...PDF_COLORS.surface);
  pdf.setDrawColor(...PDF_COLORS.border);
  pdf.roundedRect(x, y, width, height, 2, 2, 'FD');

  pdf.setFillColor(...PDF_COLORS.honey);
  pdf.roundedRect(x, y, width, 1.4, 1, 1, 'F');

  pdf.setTextColor(...PDF_COLORS.mutedText);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.text(toPdfText(label).toUpperCase(), x + 4, y + 6);

  pdf.setTextColor(...PDF_COLORS.text);
  pdf.setFontSize(10);
  pdf.text(valueLines, x + 4, y + 11);
}

export function addReportFooters(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();
  const generatedAt = new Date().toLocaleString('sr-Latn-BA');

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = PDF_LAYOUT.margin;
    const footerY = pageHeight - 8;

    pdf.setDrawColor(...PDF_COLORS.border);
    pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    pdf.setTextColor(...PDF_COLORS.mutedText);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(`Generisano: ${toPdfText(generatedAt)}`, margin, footerY);
    pdf.text(`Stranica ${pageNumber} / ${pageCount}`, pageWidth - margin, footerY, {
      align: 'right',
    });
  }
}

export function hasPageSpace(pdf: jsPDF, cursorY: number, requiredHeight: number) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  return cursorY + requiredHeight <= pageHeight - PDF_LAYOUT.footerSpace;
}

export function toPdfText(value?: string | null) {
  if (!value || !value.trim()) {
    return '-';
  }

  return value
    .trim()
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'Dj')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function sanitizePdfFileName(value: string) {
  return toPdfText(value)
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'izvjestaj';
}

function fitTextLine(pdf: jsPDF, value: string, maxWidth: number) {
  const text = toPdfText(value);

  if (pdf.getTextWidth(text) <= maxWidth) {
    return text;
  }

  let shortenedText = text;

  while (shortenedText.length > 1 && pdf.getTextWidth(`${shortenedText}...`) > maxWidth) {
    shortenedText = shortenedText.slice(0, -1);
  }

  return `${shortenedText.trimEnd()}...`;
}
