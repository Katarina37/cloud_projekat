// Pomocni kod za pravljenje PDF-a (exportHiveInspectionsPdf).

import type { HiveInspectionDto } from '../api/apiClient';
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

export async function exportHiveInspectionsPdf(
  apiaryName: string,
  hiveLabel: string,
  inspections: HiveInspectionDto[],
  totalCount: number,
) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = PDF_LAYOUT.margin;
  const contentWidth = pageWidth - margin * 2;
  const reportTitle = 'Karton kosnice';
  const reportSubtitle = `${toPdfText(apiaryName)} / ${toPdfText(hiveLabel)}`;
  let cursorY = addReportHeader(pdf, reportTitle, reportSubtitle, 'Dnevnik pregleda');

  const statGap = 4;
  const statWidth = (contentWidth - statGap * 2) / 3;
  drawStatCard(pdf, margin, cursorY, statWidth, 'Pcelinjak', apiaryName);
  drawStatCard(pdf, margin + statWidth + statGap, cursorY, statWidth, 'Kosnica', hiveLabel);
  drawStatCard(
    pdf,
    margin + (statWidth + statGap) * 2,
    cursorY,
    statWidth,
    'Ukupno zapisa',
    String(totalCount),
  );
  cursorY += 27;

  const header = [
    'Datum',
    'Ramovi med',
    'Ramovi leglo',
    'Boja podnjace',
    'Med (kg)',
    'Matica',
    'Napomena',
  ];
  const columnWidths = [28, 25, 25, 39, 23, 22, 111];

  function drawTableHeader() {
    let cursorX = margin;
    const rowHeight = 10;

    header.forEach((value, index) => {
      const cellWidth = columnWidths[index];

      pdf.setFillColor(...PDF_COLORS.green);
      pdf.setDrawColor(...PDF_COLORS.white);
      pdf.rect(cursorX, cursorY, cellWidth, rowHeight, 'FD');

      pdf.setTextColor(...PDF_COLORS.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(value, cursorX + 2.5, cursorY + 6.3);
      cursorX += cellWidth;
    });

    cursorY += rowHeight;
  }

  drawTableHeader();

  inspections.forEach((inspection, rowIndex) => {
    const values = [
      formatDate(inspection.date),
      String(inspection.framesWithHoney),
      String(inspection.broodFrames),
      toPdfText(inspection.bottomBoardColor),
      formatWeight(inspection.honeyQuantityKg),
      inspection.queenPresent ? 'Da' : 'Ne',
      toPdfText(inspection.notes),
    ];
    const wrappedValues = values.map((value, columnIndex) =>
      pdf.splitTextToSize(value, columnWidths[columnIndex] - 5),
    );
    const rowHeight = Math.max(
      10,
      ...wrappedValues.map((lines) => lines.length * 4 + 4),
    );

    if (!hasPageSpace(pdf, cursorY, rowHeight)) {
      pdf.addPage();
      cursorY = addReportHeader(
        pdf,
        reportTitle,
        `${reportSubtitle} - nastavak`,
        'Dnevnik pregleda',
      );
      drawTableHeader();
    }

    let cursorX = margin;

    wrappedValues.forEach((lines, columnIndex) => {
      const cellWidth = columnWidths[columnIndex];

      pdf.setFillColor(
        ...(rowIndex % 2 === 0 ? PDF_COLORS.white : PDF_COLORS.surface),
      );
      pdf.setDrawColor(...PDF_COLORS.border);
      pdf.rect(cursorX, cursorY, cellWidth, rowHeight, 'FD');

      if (columnIndex === 5) {
        const queenPresent = inspection.queenPresent;
        const badgeWidth = 12;
        const badgeX = cursorX + (cellWidth - badgeWidth) / 2;

        pdf.setFillColor(
          ...(queenPresent ? PDF_COLORS.successSurface : PDF_COLORS.warningSurface),
        );
        pdf.roundedRect(badgeX, cursorY + 2.2, badgeWidth, 5.5, 2, 2, 'F');
        pdf.setTextColor(
          ...(queenPresent ? PDF_COLORS.successText : PDF_COLORS.warningText),
        );
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.text(queenPresent ? 'DA' : 'NE', cursorX + cellWidth / 2, cursorY + 6, {
          align: 'center',
        });
      } else {
        pdf.setTextColor(...PDF_COLORS.text);
        pdf.setFont('helvetica', columnIndex === 0 ? 'bold' : 'normal');
        pdf.setFontSize(8);
        pdf.text(lines, cursorX + 2.5, cursorY + 6);
      }

      cursorX += cellWidth;
    });

    cursorY += rowHeight;
  });

  if (inspections.length === 0) {
    pdf.setFillColor(...PDF_COLORS.surface);
    pdf.setTextColor(...PDF_COLORS.mutedText);
    pdf.roundedRect(margin, cursorY + 6, contentWidth, 20, 2, 2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Nema evidentiranih pregleda za odabranu kosnicu.', pageWidth / 2, cursorY + 17, {
      align: 'center',
    });
  }

  addReportFooters(pdf);
  pdf.save(`karton-kosnice-${sanitizePdfFileName(hiveLabel)}.pdf`);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? toPdfText(value) : date.toLocaleDateString('sr-Latn-BA');
}

function formatWeight(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '-';
}
