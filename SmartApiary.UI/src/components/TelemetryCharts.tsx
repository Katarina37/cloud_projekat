import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyWeightDeltaDto, TelemetryReadingDto } from '../api/apiClient';
import ChartCard from './ChartCard';

type TelemetryChartsProps = {
  telemetryReadings: TelemetryReadingDto[];
  dailyDeltas: DailyWeightDeltaDto[];
};

export default function TelemetryCharts({ telemetryReadings, dailyDeltas }: TelemetryChartsProps) {
  const telemetryChartData = telemetryReadings.map((reading) => ({
    timestamp: formatTimestamp(reading.timestamp),
    weightKg: reading.weightKg,
    temperatureCelsius: reading.temperatureCelsius,
    humidityPercent: reading.humidityPercent,
  }));
  const deltaChartData = dailyDeltas.map((delta) => ({
    date: formatDate(delta.date),
    deltaKg: delta.deltaKg,
  }));

  return (
    <>
      <section className="card-grid two">
        <ChartCard title="Težina kroz vreme" subtitle="Poslednjih 7 dana">
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={telemetryChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="timestamp" tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} unit=" kg" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weightKg"
                name="Težina"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Temperatura i vlažnost" subtitle="Uslovi u košnici">
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={telemetryChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="timestamp" tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperatureCelsius"
                name="Temperatura"
                stroke="#EA580C"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="humidityPercent"
                name="Vlažnost"
                stroke="#22C55E"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <ChartCard title="Dnevna promena težine" subtitle="Promena po danima">
        {deltaChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deltaChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit=" kg" />
              <Tooltip />
              <Bar dataKey="deltaKg" name="Promena" radius={[8, 8, 0, 0]} shape={(props: any) => {
                  const {x, y, width, height, value} = props;
                  const fill = value >= 0 ? '#22C55E' : '#EF4444';
                  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={8} ry={8}/>;
              }}/>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <strong>Nema dnevnih promena.</strong>
            <p>Za izabrani period backend nije vratio dnevnu promenu težine.</p>
          </div>
        )}
      </ChartCard>
    </>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('sr-Latn-RS', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  });
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
