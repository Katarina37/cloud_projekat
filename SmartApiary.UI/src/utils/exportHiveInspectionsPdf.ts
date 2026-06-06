import type { HiveInspectionDto } from '../api/apiClient';

export async function exportHiveInspectionsPdf(
  apiaryName: string,
  hiveLabel: string,
  inspections: HiveInspectionDto[],
  totalCount: number,
) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 6;
  let cursorY = margin;

  function addLine(text: string, fontSize = 10, bold = false) {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(fontSize);
    const wrappedLines = pdf.splitTextToSize(text, contentWidth);

    if (cursorY + wrappedLines.length * lineHeight > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }

    pdf.text(wrappedLines, margin, cursorY);
    cursorY += wrappedLines.length * lineHeight;
  }

  addLine('Karton košnice', 16, true);
  cursorY += 2;
  addLine(`Pčelinjak: ${apiaryName}`);
  addLine(`Košnica: ${hiveLabel}`);
  addLine(`Ukupno zapisa: ${totalCount}`);
  cursorY += 4;

  const header = [
    'Datum',
    'Ramovi med',
    'Ramovi leglo',
    'Boja podnjače',
    'Med (kg)',
    'Matica',
    'Napomena',
  ];
  const columnWidths = [28, 20, 20, 28, 18, 16, 60];

  function drawRow(values: string[], isHeader = false) {
    const rowHeight = isHeader ? 8 : 10;

    if (cursorY + rowHeight > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }

    let cursorX = margin;
    pdf.setFontSize(isHeader ? 9 : 8);
    pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');

    values.forEach((value, index) => {
      const cellWidth = columnWidths[index];
      const wrappedText = pdf.splitTextToSize(value, cellWidth - 2);
      const cellHeight = Math.max(rowHeight, wrappedText.length * 4 + 2);

      if (cursorY + cellHeight > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin;
        cursorX = margin;
      }

      pdf.rect(cursorX, cursorY, cellWidth, cellHeight);
      pdf.text(wrappedText, cursorX + 1, cursorY + 4);
      cursorX += cellWidth;
    });

    cursorY += rowHeight + 2;
  }

  drawRow(header, true);

  inspections.forEach((inspection) => {
    const bottomBoardColor = inspection.bottomBoardColor && inspection.bottomBoardColor.trim()
      ? inspection.bottomBoardColor
      : '-';
    const notes = inspection.notes && inspection.notes.trim()
      ? inspection.notes.trim()
      : '-';

    drawRow([
      formatDate(inspection.date),
      String(inspection.framesWithHoney),
      String(inspection.broodFrames),
      bottomBoardColor,
      formatWeight(inspection.honeyQuantityKg),
      inspection.queenPresent ? 'Da' : 'Ne',
      notes,
    ]);
  });

  pdf.save(`karton-kosnice-${hiveLabel}.pdf`);
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatWeight(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '-';
}
