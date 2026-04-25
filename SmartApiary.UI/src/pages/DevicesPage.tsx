import { Battery, Cpu, Plus, Radio, Wifi, WifiOff } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { devices } from '../data/mockData';

export default function DevicesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Uređaji"
        subtitle="Pametne vage, status uparivanja i baterija"
        action={
          <button className="primary-button" type="button">
            <Plus size={18} />
            Registruj uređaj
          </button>
        }
      />

      <section className="card-grid two">
        {devices.map((device) => (
          <article className="section-card device-card" key={device.id}>
            <div className="device-card-main">
              <div className="section-icon">
                <Cpu size={20} />
              </div>
              <div>
                <h2>{device.name}</h2>
                <p>{device.serial}</p>
              </div>
              <StatusBadge tone={device.statusTone}>{device.paired ? 'Uparen' : 'Neuparen'}</StatusBadge>
            </div>

            <div className="detail-grid">
              <div>
                <span>Košnica</span>
                <strong>{device.hive}</strong>
              </div>
              <div>
                <span>Baterija</span>
                <strong className="inline-metric">
                  <Battery size={15} />
                  {device.battery}%
                </strong>
              </div>
              <div>
                <span>Signal</span>
                <strong className="inline-metric">
                  {device.paired ? <Wifi size={15} /> : <WifiOff size={15} />}
                  {device.signal}
                </strong>
              </div>
              <div>
                <span>Tip veze</span>
                <strong className="inline-metric">
                  <Radio size={15} />
                  LoRaWAN
                </strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
