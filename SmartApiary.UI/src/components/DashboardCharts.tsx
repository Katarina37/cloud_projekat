// Zajednicka UI komponenta: DashboardCharts.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyWeightDeltaDto } from '../api/apiClient';
import ChartCard from './ChartCard';

type DashboardChartsProps = {
  dailyDeltas: DailyWeightDeltaDto[];
};

export default function DashboardCharts({ dailyDeltas }: DashboardChartsProps) {
  const chartData = dailyDeltas.map((delta) => ({
    date: formatDate(delta.date),
    fullDate: formatFullDate(delta.date),
    deltaKg: delta.deltaKg,
  }));

  return (
    <ChartCard title="Dnevna promena težine" subtitle="Poslednjih 7 dana">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} unit="%" />
            <Tooltip content={<WeightDeltaTooltip />} cursor={{ fill: 'rgba(217, 150, 31, 0.08)' }} />
            <Bar dataKey="deltaKg" name="Promena" radius={[8, 8, 0, 0]}>
              {chartData.map((item) => (
                <Cell fill={getBarColor(item.deltaKg)} key={item.date} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="empty-state">
          <strong>Nema podataka za prikaz</strong>
        </div>
      )}
    </ChartCard>
  );
}

type WeightDeltaTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: {
      deltaKg?: number;
      fullDate?: string;
    };
  }>;
};

function WeightDeltaTooltip({ active, payload }: WeightDeltaTooltipProps) {
  const point = payload?.[0]?.payload;

  if (!active || !point || typeof point.deltaKg !== 'number') {
    return null;
  }

  return (
    <div className="chart-delta-tooltip">
      <span className="chart-delta-tooltip-date">{point.fullDate}</span>
      <div className="chart-delta-tooltip-value">
        <span>Promena</span>
        <strong>{formatPercent(point.deltaKg)}</strong>
      </div>
    </div>
  );
}

function getBarColor(deltaKg: number) {
  if (deltaKg > 0) {
    return '#22C55E';
  }

  if (deltaKg < 0) {
    return '#EF4444';
  }

  return '#F6B800';
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('sr-Latn-RS', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatFullDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('sr-Latn-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatPercent(value: number) {
  return `${value.toLocaleString('sr-Latn-RS', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}%`;
}
