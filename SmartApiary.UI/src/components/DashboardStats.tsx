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
    <section className="stats-grid dashboard-stats-grid" aria-label="Dashboard statistika">
      <StatCard
        title="Pčelinjaci"
        value={String(apiaries.length)}
        detail="ukupno evidentirano"
        icon={<MapPinned size={20} />}
      />
      <StatCard
        title="Košnice"
        value={String(hives.length)}
        detail="za izabrani pčelinjak"
        icon={<Hexagon size={20} />}
        tone="orange"
      />
      <StatCard
        title="Upozorenja"
        value={String(unreadAlertsCount)}
        detail="neprocitana upozorenja"
        icon={<AlertTriangle size={20} />}
        tone="red"
      />
      <StatCard
        title="Uređaji"
        value={String(deviceCount)}
        detail="za izabranu košnicu"
        icon={<Cpu size={20} />}
        tone="green"
      />
    </section>
  );
}
