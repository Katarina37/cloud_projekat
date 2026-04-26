import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createHive,
  getApiErrorMessage,
  updateHive,
  type CreateHiveRequest,
  type HiveDto,
  type HiveType,
  type HiveTypeValue,
  type UpdateHiveRequest,
} from '../api/apiClient';

type HiveFormModalProps = {
  selectedApiaryId: string;
  hive?: HiveDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

type ValidatedHiveForm =
  | { operation: 'create'; payload: CreateHiveRequest }
  | { operation: 'edit'; payload: UpdateHiveRequest };

const HIVE_TYPE_OPTIONS = [
  { label: 'LR', value: 0 },
  { label: 'DB', value: 1 },
  { label: 'Poloska', value: 2 },
  { label: 'Other', value: 3 },
] as const satisfies readonly { label: string; value: HiveTypeValue }[];

export default function HiveFormModal({ selectedApiaryId, hive, onClose, onSaved }: HiveFormModalProps) {
  const isEditMode = Boolean(hive);
  const [label, setLabel] = useState(hive?.label ?? '');
  const [type, setType] = useState<HiveTypeValue>(getHiveTypeValue(hive?.type));
  const [boxColor, setBoxColor] = useState(hive?.boxColor ?? '');
  const [queenAgeYears, setQueenAgeYears] = useState(hive ? String(hive.queenAgeYears) : '0');
  const [notes, setNotes] = useState(hive?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): ValidatedHiveForm | null => {
    const trimmedLabel = label.trim();
    const trimmedBoxColor = boxColor.trim();
    const trimmedNotes = notes.trim();
    const parsedQueenAgeYears = Number(queenAgeYears);

    if (!isEditMode && !selectedApiaryId) {
      setError('Izaberite pčelinjak.');
      return null;
    }

    if (!trimmedLabel) {
      setError('Label ne sme biti prazan.');
      return null;
    }

    if (!trimmedBoxColor) {
      setError('BoxColor ne sme biti prazan.');
      return null;
    }

    if (queenAgeYears.trim() === '' || !Number.isFinite(parsedQueenAgeYears) || parsedQueenAgeYears < 0) {
      setError('QueenAgeYears ne sme biti negativan.');
      return null;
    }

    const payload = {
      label: trimmedLabel,
      type,
      boxColor: trimmedBoxColor,
      queenAgeYears: parsedQueenAgeYears,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    };

    setError(null);

    if (hive) {
      return { operation: 'edit', payload };
    }

    return {
      operation: 'create',
      payload: {
        apiaryId: selectedApiaryId,
        ...payload,
      },
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateForm();

    if (!result) {
      return;
    }

    setLoading(true);

    try {
      if (result.operation === 'edit' && hive) {
        await updateHive(hive.id, result.payload);
      } else if (result.operation === 'create') {
        await createHive(result.payload);
      }

      await onSaved();
      setLoading(false);
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(error, isEditMode ? 'Greška pri izmeni košnice.' : 'Greška pri dodavanju košnice.'),
      );
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
            <select onChange={(event) => setType(Number(event.target.value) as HiveTypeValue)} value={type}>
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
