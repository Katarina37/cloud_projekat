import type { SprayingAnnouncementDto } from '../api/apiClient';

export async function exportSprayingHistoryPdf(
  parcelName: string,
  treatments: SprayingAnnouncementDto[],
  fromDate?: string,
  toDate?: string,
) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  let cursorY = margin;

  function addLine(text: string, bold = false) {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(bold ? 14 : 10);
    const lines = pdf.splitTextToSize(text, contentWidth);

    if (cursorY + lines.length * 6 > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }

    pdf.text(lines, margin, cursorY);
    cursorY += lines.length * 6;
  }

  addLine('Digitalni karton prskanja', true);
  addLine(`Parcela: ${parcelName}`);
  addLine(`Farmer: ${formatText(treatments[0]?.farmerName)}`);
  addLine(`Period: ${formatPeriod(fromDate, toDate)}`);
  addLine(`Broj zavrsenih tretmana: ${treatments.length}`);
  cursorY += 4;

  treatments.forEach((treatment, index) => {
    addLine(`${index + 1}. Preparat: ${formatText(treatment.preparationType)}`, true);
    addLine(`Kultura: ${formatText(treatment.cropName)}`);
    addLine(`Stvarni pocetak: ${formatDateTime(treatment.actualStartTime)}`);
    addLine(`Stvarni kraj: ${formatDateTime(treatment.actualEndTime)}`);
    addLine(`Status: ${formatText(treatment.status)}`);
    addLine(`Vreme: ${formatWeather(treatment)}`);
    addLine(`Napomena: ${formatText(treatment.note)}`);
    cursorY += 3;
  });

  pdf.save(`karton-prskanja-${sanitizeFileName(parcelName)}.pdf`);
}

function formatWeather(treatment: SprayingAnnouncementDto) {
  const weather = treatment.weatherSnapshot;

  if (!weather) {
    return 'Nema dostupnih podataka';
  }

  const description = formatText(weather.description);
  const rain = weather.hasRain ? 'da' : 'ne';
  return `${description}; vetar ${weather.windSpeed.toFixed(1)} m/s; kisa ${rain}`;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('sr-Latn-RS');
}

function formatPeriod(fromDate?: string, toDate?: string) {
  if (!fromDate && !toDate) {
    return 'svi zapisi';
  }

  return `${fromDate || 'pocetak'} - ${toDate || 'danas'}`;
}

function formatText(value?: string | null) {
  return value && value.trim() ? value.trim() : '-';
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'parcela';
}
