// Pomocni kod za pravljenje PDF-a (exportMapPdf).

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  addReportFooters,
  addReportHeader,
  PDF_COLORS,
  PDF_LAYOUT,
} from './pdfReport';

export async function exportMapPdf() {
  const mapElement = document.querySelector('.leaflet-container');

  if (!(mapElement instanceof HTMLElement)) {
    throw new Error('Mapa nije pronadjena za PDF export.');
  }

  await waitForMapTiles(mapElement);

  const canvas = await html2canvas(mapElement, {
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#f7f9f7',
    imageTimeout: 15000,
    scale: Math.min(window.devicePixelRatio || 1, 2),
    scrollX: 0,
    scrollY: 0,
    onclone: (documentClone) => {
      documentClone
        .querySelectorAll('.leaflet-control-container, .leaflet-popup-pane')
        .forEach((element) => {
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
          }
        });
    },
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

function waitForMapTiles(mapElement: HTMLElement) {
  const tileImages = Array.from(
    mapElement.querySelectorAll<HTMLImageElement>('.leaflet-tile'),
  );

  const pendingTiles = tileImages.filter((image) => !image.complete);

  if (pendingTiles.length === 0) {
    return Promise.resolve();
  }

  return Promise.race([
    Promise.all(
      pendingTiles.map((image) =>
        new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
      ),
    ).then(() => undefined),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2500);
    }),
  ]);
}
