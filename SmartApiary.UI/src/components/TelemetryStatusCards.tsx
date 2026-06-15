// Zajednicka UI komponenta: TelemetryStatusCards.

import { Battery, Clock, Droplets, Scale, Thermometer } from 'lucide-react';
import type { LatestHiveStatusDto } from '../api/apiClient';
import SectionCard from './SectionCard';
import StatCard from './StatCard';

type TelemetryStatusCardsProps = {
  latestStatus: LatestHiveStatusDto | null;
};

export default function TelemetryStatusCards({ latestStatus }: TelemetryStatusCardsProps) {
  if (!latestStatus) {
    return (
      <SectionCard title="Poslednje merenje" subtitle="Status košnice">
        Još nema poslednjeg merenja.
      </SectionCard>
    );
  }

  return (
    <section className="stats-grid" aria-label="Poslednje merenje">
      <StatCard
        title="Trenutna težina"
        value={`${formatNumber(latestStatus.weightKg, 1)} kg`}
        detail="poslednje merenje"
        icon={<Scale size={20} />}
        tone="green"
      />
      <StatCard
        title="Temperatura"
        value={`${formatNumber(latestStatus.temperatureCelsius, 1)}°C`}
        detail="poslednje merenje"
        icon={<Thermometer size={20} />}
        tone="green"
      />
      <StatCard
        title="Vlažnost"
        value={`${formatNumber(latestStatus.humidityPercent, 0)}%`}
        detail="poslednje merenje"
        icon={<Droplets size={20} />}
        tone="green"
      />
      <StatCard
        title="Baterija"
        value={`${formatNumber(latestStatus.batteryPercent, 0)}%`}
        detail="poslednje merenje"
        icon={<Battery size={20} />}
        tone="green"
      />
      <StatCard
        title="Vreme poslednjeg merenja"
        value={formatDateTime(latestStatus.timestamp)}
        detail="vreme zapisa"
        icon={<Clock size={20} />}
        tone="green"
      />
    </section>
  );
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat('sr-Latn-RS', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleString('sr-Latn-RS', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  });
}
