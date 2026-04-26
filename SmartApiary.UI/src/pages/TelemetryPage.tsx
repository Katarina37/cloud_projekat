import { Battery, Droplets, Scale, Thermometer } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../components/ChartCard';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { hives, telemetryTimeline, weightTrend } from '../data/mockData';

const latestMeasurement = telemetryTimeline[telemetryTimeline.length - 1];

export default function TelemetryPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Telemetrija" subtitle="Grafovi težine, temperature, vlažnosti i poslednje merenje" />

      <SectionCard title="Filter" subtitle="Lokalni prikaz telemetrije">
        <div className="filter-row">
          <label>
            Košnica
            <select defaultValue="K-01">
              {hives.map((hive) => (
                <option key={hive.id} value={hive.code}>
                  {hive.code} · {hive.apiary}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SectionCard>

      <section className="card-grid two">
        <ChartCard title="Graf težine" subtitle="Košnica K-01, poslednjih 7 dana">
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={weightTrend} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit="kg" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" name="Težina" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Temperatura i vlažnost" subtitle="Unutrašnji uslovi košnice">
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={telemetryTimeline} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" name="Temperatura" stroke="#EA580C" strokeWidth={3} />
              <Line type="monotone" dataKey="humidity" name="Vlažnost" stroke="#22C55E" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <SectionCard title="Poslednje merenje" subtitle="Košnica K-01 u 18:00">
        <div className="measurement-strip">
          <article className="measurement-tile">
            <span>Težina</span>
            <strong className="inline-metric">
              <Scale size={17} />
              {latestMeasurement.weight.toFixed(1)} kg
            </strong>
          </article>
          <article className="measurement-tile">
            <span>Temperatura</span>
            <strong className="inline-metric">
              <Thermometer size={17} />
              {latestMeasurement.temperature.toFixed(1)}°C
            </strong>
          </article>
          <article className="measurement-tile">
            <span>Vlažnost</span>
            <strong className="inline-metric">
              <Droplets size={17} />
              {latestMeasurement.humidity}%
            </strong>
          </article>
          <article className="measurement-tile">
            <span>Baterija</span>
            <strong className="inline-metric">
              <Battery size={17} />
              84%
            </strong>
          </article>
        </div>
      </SectionCard>
    </div>
  );
}
