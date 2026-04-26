import {
  Bar,
  BarChart,
  CartesianGrid,
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
    deltaKg: delta.deltaKg,
  }));

  return (
    <ChartCard title="Dnevna promena težine" subtitle="Poslednjih 7 dana">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} unit=" kg" />
            <Tooltip />
            <Bar dataKey="deltaKg" name="Promena" fill="#F6B800" radius={[8, 8, 0, 0]} />
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
