import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { activateDevice, getApiErrorMessage, type ActivateDeviceRequest } from '../api/apiClient';

type ActivateDeviceModalProps = {
  initialSerialNumber: string;
  onClose: () => void;
  onDeviceActivated: (accessToken?: string) => Promise<void>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ActivateDeviceModal({
  initialSerialNumber,
  onClose,
  onDeviceActivated,
}: ActivateDeviceModalProps) {
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber);
  const [deviceIdentifier, setDeviceIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSerialNumber(initialSerialNumber);
    setDeviceIdentifier('');
    setError(null);
  };

  const validateForm = (): ActivateDeviceRequest | null => {
    const trimmedSerialNumber = serialNumber.trim();
    const trimmedDeviceIdentifier = deviceIdentifier.trim();

    if (!trimmedSerialNumber) {
      setError('SerialNumber ne sme biti prazan.');
      return null;
    }

    if (!trimmedDeviceIdentifier) {
      setError('DeviceIdentifier ne sme biti prazan.');
      return null;
    }

    if (!UUID_PATTERN.test(trimmedDeviceIdentifier)) {
      setError('DeviceIdentifier mora biti validan UUID.');
      return null;
    }

    setError(null);
    return {
      serialNumber: trimmedSerialNumber,
      deviceIdentifier: trimmedDeviceIdentifier,
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
      const accessToken = await activateDevice(payload);
      await onDeviceActivated(accessToken);
      resetForm();
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri aktivaciji uređaja.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="activate-device-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="activate-device-title">Aktiviraj uređaj</h2>
            <p>Unesi identifikator uređaja koji se uparuje.</p>
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

          <label>
            DeviceIdentifier
            <input
              onChange={(event) => setDeviceIdentifier(event.target.value)}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              type="text"
              value={deviceIdentifier}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={loading} type="submit">
            {loading ? 'Aktivacija...' : 'Aktiviraj uređaj'}
          </button>
        </form>
      </section>
    </div>
  );
}
