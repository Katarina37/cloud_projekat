// Modal za unos i izmenu podataka (HiveFormModal).

import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createHive,
  getApiErrorMessage,
  updateHive,
  type HiveDto,
  type HiveType,
  type HiveTypeValue,
} from '../api/apiClient';

type HiveFormModalProps = {
  selectedApiaryId: string;
  hive?: HiveDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const HIVE_TYPE_OPTIONS: { label: string; value: HiveTypeValue }[] = [
  { label: 'LR', value: 0 },
  { label: 'DB', value: 1 },
  { label: 'Poloska', value: 2 },
  { label: 'Other', value: 3 },
];

export default function HiveFormModal({ selectedApiaryId, hive, onClose, onSaved }: HiveFormModalProps) {
  const isEditMode = hive !== undefined;
  const [label, setLabel] = useState(hive ? hive.label : '');
  const [type, setType] = useState<HiveTypeValue>(
    getHiveTypeValue(hive ? hive.type : undefined),
  );
  const [boxColor, setBoxColor] = useState(hive ? hive.boxColor : '');
  const [queenAgeYears, setQueenAgeYears] = useState(hive ? String(hive.queenAgeYears) : '0');
  const [notes, setNotes] = useState(hive && hive.notes ? hive.notes : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (value: string) => {
    const selectedType = Number(value);

    if (selectedType === 0 || selectedType === 1 || selectedType === 2 || selectedType === 3) {
      setType(selectedType);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedLabel = label.trim();
    const trimmedBoxColor = boxColor.trim();
    const trimmedNotes = notes.trim();
    const parsedQueenAgeYears = Number(queenAgeYears);

    if (!isEditMode && !selectedApiaryId) {
      setError('Izaberite pčelinjak.');
      return;
    }

    if (!trimmedLabel) {
      setError('Label ne sme biti prazan.');
      return;
    }

    if (!trimmedBoxColor) {
      setError('BoxColor ne sme biti prazan.');
      return;
    }

    if (queenAgeYears.trim() === '' || !Number.isFinite(parsedQueenAgeYears) || parsedQueenAgeYears < 0) {
      setError('QueenAgeYears ne sme biti negativan.');
      return;
    }

    const payload = {
      label: trimmedLabel,
      type,
      boxColor: trimmedBoxColor,
      queenAgeYears: parsedQueenAgeYears,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    };

    setError(null);
    setLoading(true);

    try {
      if (hive) {
        await updateHive(hive.id, payload);
      } else {
        await createHive({
          apiaryId: selectedApiaryId,
          ...payload,
        });
      }

      await onSaved();
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(error, isEditMode ? 'Greška pri izmeni košnice.' : 'Greška pri dodavanju košnice.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const title = isEditMode ? 'Izmeni košnicu' : 'Dodaj košnicu';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="hive-form-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="hive-form-title">{title}</h2>
            <p>Unesi osnovne podatke za košnicu.</p>
          </div>
          <button aria-label="Zatvori modal" className="modal-close-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Label
            <input
              autoFocus
              onChange={(event) => setLabel(event.target.value)}
              placeholder="K-01"
              type="text"
              value={label}
            />
          </label>

          <label>
            Type
            <select onChange={(event) => handleTypeChange(event.target.value)} value={type}>
              {HIVE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            BoxColor
            <input
              onChange={(event) => setBoxColor(event.target.value)}
              placeholder="Žuta"
              type="text"
              value={boxColor}
            />
          </label>

          <label>
            QueenAgeYears
            <input
              min="0"
              onChange={(event) => setQueenAgeYears(event.target.value)}
              step="1"
              type="number"
              value={queenAgeYears}
            />
          </label>

          <label>
            Notes
            <textarea
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Napomena"
              rows={4}
              value={notes}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={loading} type="submit">
            {loading ? 'Čuvanje...' : title}
          </button>
        </form>
      </section>
    </div>
  );
}

function getHiveTypeValue(type?: HiveType): HiveTypeValue {
  if (type === 0 || type === 1 || type === 2 || type === 3) {
    return type;
  }

  if (typeof type === 'string') {
    const parsedType = Number(type);

    if (parsedType === 0 || parsedType === 1 || parsedType === 2 || parsedType === 3) {
      return parsedType;
    }

    if (type === 'DB') {
      return 1;
    }

    if (type === 'Poloska') {
      return 2;
    }

    if (type === 'Other') {
      return 3;
    }
  }

  return 0;
}
