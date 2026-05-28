import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createAdminUser,
  getApiErrorMessage,
  type CreateAdminUserRequest,
  type UserRole,
} from '../api/apiClient';

type AdminUserFormModalProps = {
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'Beekeeper', label: 'Beekeeper' },
  { value: 'Farmer', label: 'Farmer' },
];

export default function AdminUserFormModal({ onClose, onSaved }: AdminUserFormModalProps) {
  const [form, setForm] = useState<CreateAdminUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'Beekeeper',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createAdminUser(form);
      await onSaved();
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Kreiranje korisnika nije uspelo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation">
      <section aria-modal="true" className="modal-card" role="dialog">
        <div className="modal-header">
          <div>
            <h2>Novi korisnik</h2>
            <p>Korisnik aktivira nalog preko linka koji se šalje emailom preko SendGrid-a nakon kreiranja.</p>
          </div>
          <button aria-label="Zatvori" className="modal-close-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Ime
            <input
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              required
              type="text"
              value={form.firstName}
            />
          </label>

          <label>
            Prezime
            <input
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              required
              type="text"
              value={form.lastName}
            />
          </label>

          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Telefon
            <input
              onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
              required
              type="tel"
              value={form.phoneNumber}
            />
          </label>

          <label>
            Uloga
            <select
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
              value={form.role}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button orange-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Cuvanje...' : 'Kreiraj korisnika'}
          </button>
        </form>
      </section>
    </div>
  );
}
