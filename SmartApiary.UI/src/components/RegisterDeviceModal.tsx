import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { getApiErrorMessage, registerDevice, type RegisterDeviceRequest } from '../api/apiClient';

type RegisterDeviceModalProps = {
  selectedHiveId: string;
  onClose: () => void;
  onDeviceRegistered: () => Promise<void>;
};

const SERIAL_NUMBER_PATTERN = /^SA-\d{4}-\d{5}$/;

export default function RegisterDeviceModal({
  selectedHiveId,
  onClose,
  onDeviceRegistered,
}: RegisterDeviceModalProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSerialNumber('');
    setError(null);
  };

  const validateForm = (): RegisterDeviceRequest | null => {
    const trimmedSerialNumber = serialNumber.trim();

    if (!selectedHiveId) {
      setError('Izaberite košnicu.');
      return null;
    }

    if (!trimmedSerialNumber) {
      setError('SerialNumber ne sme biti prazan.');
      return null;
    }

    if (!SERIAL_NUMBER_PATTERN.test(trimmedSerialNumber)) {
      setError('SerialNumber mora pratiti format SA-YYYY-XXXXX.');
      return null;
    }

    setError(null);
    return {
      hiveId: selectedHiveId,
      serialNumber: trimmedSerialNumber,
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
      await registerDevice(payload);
      await onDeviceRegistered();
      resetForm();
      setLoading(false);
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri registraciji uređaja.'));
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="register-device-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="register-device-title">Registruj uređaj</h2>
            <p>Unesi serijski broj uređaja za izabranu košnicu.</p>
          </div>
          <button aria-label="Zatvori modal" className="modal-close-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            SerialNumber
            <input
              autoFocus
              onChange={(event) => setSerialNumber(event.target.value)}
              placeholder="SA-2026-12345"
              type="text"
              value={serialNumber}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={loading} type="submit">
            {loading ? 'Registracija...' : 'Registruj uređaj'}
          </button>
        </form>
      </section>
    </div>
  );
}
