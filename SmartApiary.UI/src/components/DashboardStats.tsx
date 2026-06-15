// Zajednicka UI komponenta: DashboardStats.

import { AlertTriangle, Cpu, Hexagon, MapPinned } from 'lucide-react';
import type { AlertDto, ApiaryDto, HiveDto } from '../api/apiClient';
import StatCard from './StatCard';

type DashboardStatsProps = {
  apiaries: ApiaryDto[];
  hives: HiveDto[];
  alerts: AlertDto[];
  deviceCount: number;
};

export default function DashboardStats({ apiaries, hives, alerts, deviceCount }: DashboardStatsProps) {
  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;

  return (
    <section className="dashboard-metric-section" aria-labelledby="dashboard-summary-title">
      <div className="dashboard-section-heading">
        <div>
          <span className="dashboard-section-kicker">Sažetak</span>
          <h2 id="dashboard-summary-title">Stanje sistema</h2>
        </div>
        <span className="dashboard-section-note">Trenutni pregled</span>
      </div>

      <div className="stats-grid dashboard-stats-grid">
        <StatCard
          title="Pčelinjaci"
          value={String(apiaries.length)}
          detail="ukupno evidentirano"
          icon={<MapPinned size={28} strokeWidth={1.8} />}
          tone="apiary"
          variant="split"
        />
        <StatCard
          title="Košnice"
          value={String(hives.length)}
          detail="za izabrani pčelinjak"
          icon={<Hexagon size={28} strokeWidth={1.8} />}
          tone="hive"
          variant="split"
        />
        <StatCard
          title="Upozorenja"
          value={String(unreadAlertsCount)}
          detail="nepročitana upozorenja"
          icon={<AlertTriangle size={28} strokeWidth={1.8} />}
          tone="alert"
          variant="split"
        />
        <StatCard
          title="Uređaji"
          value={String(deviceCount)}
          detail="za izabranu košnicu"
          icon={<Cpu size={28} strokeWidth={1.8} />}
          tone="device"
          variant="split"
        />
      </div>
    </section>
  );
}
