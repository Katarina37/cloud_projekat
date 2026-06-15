// Zajednicka UI komponenta: TelemetryFilters.

import type { ApiaryDto, HiveDto } from '../api/apiClient';
import SectionCard from './SectionCard';

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
    <SectionCard title="Filteri" subtitle="Izaberite pčelinjak i košnicu">
      <div className="device-filter-grid">
        <label>
          Pčelinjak
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
            Košnica
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
    </SectionCard>
  );
}
