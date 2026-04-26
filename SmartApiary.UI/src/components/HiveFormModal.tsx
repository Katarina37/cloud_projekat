import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { createHive, getApiErrorMessage, type CreateHiveRequest } from '../api/apiClient';

type HiveFormModalProps = {
  selectedApiaryId: string;
  onClose: () => void;
  onHiveCreated: () => Promise<void>;
};

const HIVE_TYPE_OPTIONS = [
  { label: 'LR', value: 0 },
  { label: 'DB', value: 1 },
  { label: 'Poloska', value: 2 },
  { label: 'Other', value: 3 },
] as const satisfies readonly { label: string; value: CreateHiveRequest['type'] }[];

type HiveTypeLabel = (typeof HIVE_TYPE_OPTIONS)[number]['label'];

export default function HiveFormModal({ selectedApiaryId, onClose, onHiveCreated }: HiveFormModalProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<HiveTypeLabel>('LR');
  const [boxColor, setBoxColor] = useState('');
  const [queenAgeYears, setQueenAgeYears] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setLabel('');
    setType('LR');
    setBoxColor('');
    setQueenAgeYears('0');
    setNotes('');
    setError(null);
  };

  const validateForm = (): CreateHiveRequest | null => {
    const trimmedLabel = label.trim();
    const trimmedBoxColor = boxColor.trim();
    const trimmedNotes = notes.trim();
    const parsedQueenAgeYears = Number(queenAgeYears);
    const selectedType = HIVE_TYPE_OPTIONS.find((option) => option.label === type);

    if (!selectedApiaryId) {
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

    if (!selectedType) {
      setError('Type nije validan.');
      return null;
    }

    setError(null);
    return {
      apiaryId: selectedApiaryId,
      label: trimmedLabel,
      type: selectedType.value,
      boxColor: trimmedBoxColor,
      queenAgeYears: parsedQueenAgeYears,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = validateForm();

    if (!payload) {
      return;
    }

    setLoading(true);

    try {
      await createHive(payload);
      await onHiveCreated();
      resetForm();
      setLoading(false);
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri dodavanju košnice.'));
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="create-hive-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="create-hive-title">Dodaj košnicu</h2>
            <p>Unesi osnovne podatke za izabrani pčelinjak.</p>
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
            <select onChange={(event) => setType(event.target.value as HiveTypeLabel)} value={type}>
              {HIVE_TYPE_OPTIONS.map((option) => (
                <option key={option.label} value={option.label}>
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
            {loading ? 'Dodavanje...' : 'Dodaj košnicu'}
          </button>
        </form>
      </section>
    </div>
  );
}
