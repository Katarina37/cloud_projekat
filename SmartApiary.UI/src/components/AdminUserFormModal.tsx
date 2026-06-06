import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createAdminUser,
  getApiErrorMessage,
  type UserRole,
} from '../api/apiClient';

type AdminUserFormModalProps = {
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'Beekeeper', label: 'Beekeeper' },
  { value: 'Farmer', label: 'Farmer' },
];

export default function AdminUserFormModal({ onClose, onSaved }: AdminUserFormModalProps) {
  // Postavljanje pocetnih vrednosti forme.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('Beekeeper');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createAdminUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        role,
      });
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
              onChange={(event) => setFirstName(event.target.value)}
              required
              type="text"
              value={firstName}
            />
          </label>

          <label>
            Prezime
            <input
              onChange={(event) => setLastName(event.target.value)}
              required
              type="text"
              value={lastName}
            />
          </label>

          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Telefon
            <input
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
              type="tel"
              value={phoneNumber}
            />
          </label>

          <label>
            Uloga
            <select
              onChange={(event) => {
                const selectedRole = event.target.value;
                setRole(selectedRole === 'Farmer' ? 'Farmer' : 'Beekeeper');
              }}
              value={role}
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
