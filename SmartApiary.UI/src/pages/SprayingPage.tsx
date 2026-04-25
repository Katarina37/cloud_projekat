import { CalendarClock, UsersRound } from 'lucide-react';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { sprayingAnnouncements } from '../data/mockData';

type SprayingAnnouncement = (typeof sprayingAnnouncements)[number];

const columns: DataTableColumn<SprayingAnnouncement>[] = [
  {
    header: 'Parcela',
    render: (item) => (
      <div className="table-title">
        <strong>{item.parcel}</strong>
        <span>Radijus {item.radius}</span>
      </div>
    ),
  },
  {
    header: 'Datum',
    render: (item) => (
      <span className="inline-metric">
        <CalendarClock size={15} />
        {item.date}
      </span>
    ),
  },
  { header: 'Trajanje', render: (item) => item.duration },
  { header: 'Status', render: (item) => <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge> },
  {
    header: 'Obavešteno',
    render: (item) => (
      <span className="inline-metric">
        <UsersRound size={15} />
        {item.notifiedBeekeepers} pčelara
      </span>
    ),
  },
];

export default function SprayingPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Tretiranja pesticidima" subtitle="Najave, trajanje i broj obaveštenih pčelara" />

      <section className="section-card table-card">
        <DataTable
          columns={columns}
          rows={sprayingAnnouncements}
          getRowKey={(item) => item.id}
          minWidth={860}
        />
      </section>
    </div>
  );
}
