import {
  AlertTriangle,
  Battery,
  CalendarClock,
  Cpu,
  Hexagon,
  MapPinned,
  Radio,
  Scale,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AlertCard from '../components/AlertCard';
import ChartCard from '../components/ChartCard';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  alerts,
  apiaries,
  averageBattery,
  dailyWeightChange,
  devices,
  hives,
  sprayingAnnouncements,
  weightTrend,
} from '../data/mockData';

const totalHives = apiaries.reduce((sum, apiary) => sum + apiary.hivesCount, 0);
const activeDevices = devices.filter((device) => device.paired).length;
const activeAlerts = alerts.filter((alert) => !alert.read && alert.severity !== 'good').length;
const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical').length;
const pairedDevices = devices.filter((device) => device.paired);
const unpairedDevices = devices.filter((device) => !device.paired);

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Pregled sistema"
        subtitle="Stanje pčelinjaka, košnica, uređaja i upozorenja"
      />

      <section className="stats-grid">
        <StatCard
          title="Pčelinjaci"
          value={`${apiaries.length}`}
          detail="aktivne lokacije"
          icon={<MapPinned size={20} />}
        />
        <StatCard
          title="Košnice"
          value={`${totalHives}`}
          detail="evidentirano u sistemu"
          icon={<Hexagon size={20} />}
          tone="orange"
        />
        <StatCard
          title="Aktivni uređaji"
          value={`${activeDevices}`}
          detail="uparene pametne vage"
          icon={<Cpu size={20} />}
          tone="green"
        />
        <StatCard
          title="Upozorenja"
          value={`${activeAlerts}`}
          detail={`${criticalAlerts} kritično`}
          icon={<AlertTriangle size={20} />}
          tone="red"
        />
        <StatCard
          title="Prosečna baterija"
          value={`${averageBattery}%`}
          detail="prosek uređaja"
          icon={<Battery size={20} />}
          tone="honey"
        />
      </section>

      <section className="dashboard-grid">
        <SectionCard
          title="Stanje pčelinjaka"
          subtitle="Broj košnica i operativni status"
          icon={<MapPinned size={18} />}
          className="dashboard-card"
        >
          <div className="entity-list">
            {apiaries.map((apiary) => (
              <article className="entity-row" key={apiary.id}>
                <div>
                  <strong>{apiary.name}</strong>
                  <span>{apiary.location}</span>
                </div>
                <div className="entity-metrics">
                  <span>{apiary.hivesCount} košnica</span>
                  <StatusBadge tone={apiary.statusTone}>{apiary.status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <ChartCard
          title="Telemetrija košnice"
          subtitle="Košnica K-01, težina kroz dane"
          className="dashboard-card dashboard-card-wide"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightTrend} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit="kg" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" name="Težina" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <SectionCard
          title="Aktivna upozorenja"
          subtitle="Prioriteti za pregled"
          icon={<AlertTriangle size={18} />}
          className="dashboard-card"
        >
          <div className="alert-list">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} {...alert} />
            ))}
          </div>
        </SectionCard>

        <ChartCard
          title="Dnevna promena težine"
          subtitle="Unos i potrošnja u kg"
          className="dashboard-card dashboard-card-wide"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyWeightChange} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit="kg" />
              <Tooltip />
              <Bar dataKey="change" name="Promena" radius={[8, 8, 0, 0]}>
                {dailyWeightChange.map((entry) => (
                  <Cell key={entry.day} fill={entry.change >= 0 ? '#F6B800' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <SectionCard
          title="Najave tretiranja pesticidima"
          subtitle="Najbliže najave u okruženju"
          icon={<CalendarClock size={18} />}
          className="dashboard-card"
        >
          <div className="compact-list">
            {sprayingAnnouncements.slice(0, 2).map((item) => (
              <article className="compact-row" key={item.id}>
                <div>
                  <strong>{item.parcel}</strong>
                  <span>
                    {item.date} · {item.duration} · radijus {item.radius}
                  </span>
                </div>
                <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Status uređaja"
          subtitle="Upareni i neupareni uređaji"
          icon={<Radio size={18} />}
          className="dashboard-card"
        >
          <div className="device-summary">
            <div>
              <span>Upareni</span>
              <strong>{pairedDevices.length}</strong>
            </div>
            <div>
              <span>Neupareni</span>
              <strong>{unpairedDevices.length}</strong>
            </div>
          </div>
          <div className="compact-list">
            {devices.slice(0, 3).map((device) => (
              <article className="compact-row" key={device.id}>
                <div>
                  <strong>{device.serial}</strong>
                  <span>{device.hive}</span>
                </div>
                <StatusBadge tone={device.statusTone}>{device.paired ? 'Uparen' : 'Neuparen'}</StatusBadge>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Poslednje merenje"
        subtitle="Demo prikaz bez povezanog API-ja"
        icon={<Scale size={18} />}
      >
        <div className="measurement-strip">
          {hives.slice(0, 4).map((hive) => (
            <article className="measurement-tile" key={hive.id}>
              <span>{hive.code}</span>
              <strong>{hive.weight.toFixed(1)} kg</strong>
              <small>
                {hive.temperature.toFixed(1)}°C · {hive.battery}% baterija
              </small>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
