// Pomocni kod za pravljenje PDF-a (exportMapPdf).

import {
  addReportFooters,
  addReportHeader,
  PDF_COLORS,
  PDF_LAYOUT,
} from './pdfReport';

export async function exportMapPdf() {
  const mapElement = document.querySelector('.leaflet-container');

  if (!(mapElement instanceof HTMLElement)) {
    window.alert('Mapa nije pronadjena za export.');
    return;
  }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');
  const canvas = await html2canvas(mapElement, {
    useCORS: true,
    logging: false,
    backgroundColor: '#f7f9f7',
    scale: Math.min(window.devicePixelRatio || 1, 2),
  });
  const image = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const imageSize = pdf.getImageProperties(image);
  const margin = PDF_LAYOUT.margin;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const cursorY = addReportHeader(
    pdf,
    'Mapa parcela',
    'Prostorni pregled registrovanih parcela i kultura',
    'Kartografski izvjestaj',
  );
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - cursorY - PDF_LAYOUT.footerSpace - 3;
  const imageRatio = imageSize.width / imageSize.height;
  const areaRatio = availableWidth / availableHeight;

  let imageWidth = availableWidth;
  let imageHeight = imageWidth / imageRatio;

  if (imageRatio < areaRatio) {
    imageHeight = availableHeight;
    imageWidth = imageHeight * imageRatio;
  }

  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = cursorY + (availableHeight - imageHeight) / 2;

  pdf.setFillColor(...PDF_COLORS.surface);
  pdf.setDrawColor(...PDF_COLORS.border);
  pdf.roundedRect(margin, cursorY, availableWidth, availableHeight, 2.5, 2.5, 'FD');
  pdf.addImage(image, 'PNG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');

  addReportFooters(pdf);
  pdf.save('mapa-parcela.pdf');
}
