// Zajednicka UI komponenta: DashboardStatus.

import { Battery, Clock, Droplets, Scale, Thermometer } from 'lucide-react';
import type { LatestHiveStatusDto } from '../api/apiClient';
import StatCard from './StatCard';

type DashboardStatusProps = {
  latestStatus: LatestHiveStatusDto;
};

export default function DashboardStatus({ latestStatus }: DashboardStatusProps) {
  const measurementTime = formatMeasurementTime(latestStatus.timestamp);

  return (
    <section className="dashboard-metric-section" aria-labelledby="dashboard-status-title">
      <div className="dashboard-section-heading">
        <div>
          <span className="dashboard-section-kicker">Telemetrija</span>
          <h2 id="dashboard-status-title">Posljednje mjerenje</h2>
        </div>
      </div>

      <div className="stats-grid dashboard-status-grid">
        <StatCard
          title="Težina"
          value={`${formatNumber(latestStatus.weightKg, 1)} kg`}
          detail="posljednje mjerenje"
          icon={<Scale size={28} strokeWidth={1.8} />}
          tone="weight"
          variant="split"
        />
        <StatCard
          title="Temperatura"
          value={`${formatNumber(latestStatus.temperatureCelsius, 1)} °C`}
          detail="posljednje mjerenje"
          icon={<Thermometer size={28} strokeWidth={1.8} />}
          tone="temperature"
          variant="split"
        />
        <StatCard
          title="Vlažnost"
          value={`${formatNumber(latestStatus.humidityPercent, 0)}%`}
          detail="posljednje mjerenje"
          icon={<Droplets size={28} strokeWidth={1.8} />}
          tone="humidity"
          variant="split"
        />
        <StatCard
          title="Baterija"
          value={`${formatNumber(latestStatus.batteryPercent, 0)}%`}
          detail="posljednje mjerenje"
          icon={<Battery size={28} strokeWidth={1.8} />}
          tone="battery"
          variant="split"
        />
        <StatCard
          title="Posljednje očitanje"
          value={measurementTime.time}
          detail={measurementTime.date}
          icon={<Clock size={28} strokeWidth={1.8} />}
          tone="time"
          variant="split"
        />
      </div>
    </section>
  );
}

function formatNumber(value: number, fractionDigits: number) {
  return new Intl.NumberFormat('sr-Latn-RS', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function formatMeasurementTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: 'Datum nije dostupan',
      time: value || '-',
    };
  }

  return {
    date: date.toLocaleDateString('sr-Latn-RS', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('sr-Latn-RS', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
