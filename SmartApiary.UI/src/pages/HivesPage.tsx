import { Battery, Droplets, Plus, Thermometer } from 'lucide-react';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { hives } from '../data/mockData';

type Hive = (typeof hives)[number];

const columns: DataTableColumn<Hive>[] = [
  {
    header: 'Košnica',
    render: (hive) => (
      <div className="table-title">
        <strong>{hive.code}</strong>
        <span>{hive.apiary}</span>
      </div>
    ),
  },
  { header: 'Tip', render: (hive) => hive.type },
  { header: 'Težina', render: (hive) => `${hive.weight.toFixed(1)} kg` },
  {
    header: 'Temperatura',
    render: (hive) => (
      <span className="inline-metric">
        <Thermometer size={15} />
        {hive.temperature.toFixed(1)}°C
      </span>
    ),
  },
  {
    header: 'Vlažnost',
    render: (hive) => (
      <span className="inline-metric">
        <Droplets size={15} />
        {hive.humidity}%
      </span>
    ),
  },
  {
    header: 'Baterija',
    render: (hive) => (
      <span className="inline-metric">
        <Battery size={15} />
        {hive.battery}%
      </span>
    ),
  },
  { header: 'Status', render: (hive) => <StatusBadge tone={hive.statusTone}>{hive.status}</StatusBadge> },
];

export default function HivesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Košnice"
        subtitle="Oznaka, tip, telemetrija i trenutni status"
        action={
          <button className="primary-button" type="button">
            <Plus size={18} />
            Dodaj košnicu
          </button>
        }
      />

      <section className="section-card table-card">
        <DataTable columns={columns} rows={hives} getRowKey={(hive) => hive.id} minWidth={920} />
      </section>
    </div>
  );
}
