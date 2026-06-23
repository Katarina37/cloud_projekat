// Zajednicka UI komponenta: TelemetryFilters.

import { SlidersHorizontal } from 'lucide-react';
import type { ApiaryDto, HiveDto } from '../api/apiClient';

type TelemetryFiltersProps = {
  apiaries: ApiaryDto[];
  selectedApiaryId: string;
  hives: HiveDto[];
  selectedHiveId: string;
  disabled: boolean;
  onApiaryChange: (apiaryId: string) => void;
  onHiveChange: (hiveId: string) => void;
};

export default function TelemetryFilters({
  apiaries,
  selectedApiaryId,
  hives,
  selectedHiveId,
  disabled,
  onApiaryChange,
  onHiveChange,
}: TelemetryFiltersProps) {
  return (
    <section className="section-card resource-filter-card telemetry-filter-card">
      <div className="resource-filter-heading">
        <div className="resource-filter-icon">
          <SlidersHorizontal size={19} />
        </div>
        <div>
          <h2>Izaberite izvor telemetrije</h2>
          <p>Grafikoni i posljednji status pripadaju trenutno izabranoj košnici.</p>
        </div>
      </div>
      <div className="device-filter-grid telemetry-filter-grid">
        <label>
          <span><b>01</b> Pčelinjak</span>
          <select
            disabled={disabled}
            onChange={(event) => onApiaryChange(event.target.value)}
            value={selectedApiaryId}
          >
            {apiaries.map((apiary) => (
              <option key={apiary.id} value={apiary.id}>
                {apiary.name}
              </option>
            ))}
          </select>
        </label>

        {hives.length > 0 ? (
          <label>
            <span><b>02</b> Košnica</span>
            <select disabled={disabled} onChange={(event) => onHiveChange(event.target.value)} value={selectedHiveId}>
              {hives.map((hive) => (
                <option key={hive.id} value={hive.id}>
                  {hive.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </section>
  );
}
