export async function exportMapPdf() {
  const mapElement = document.querySelector('.leaflet-container');

  if (!(mapElement instanceof HTMLElement)) {
    window.alert('Mapa nije pronadjena za export.');
    return;
  }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  // Prvo pravimo sliku mape, a zatim tu sliku dodajemo u PDF.
  const canvas = await html2canvas(mapElement, {
    useCORS: true,
    logging: false,
  });
  const image = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape' });
  const imageSize = pdf.getImageProperties(image);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imageSize.height * pdfWidth) / imageSize.width;

  pdf.addImage(image, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save('parcels-map.pdf');
}
