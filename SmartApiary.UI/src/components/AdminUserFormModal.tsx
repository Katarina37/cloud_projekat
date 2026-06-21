// Modal za unos i izmenu podataka (AdminUserFormModal).

import { type FormEvent, useState } from 'react';
import { AtSign, Phone, Sprout, User, UserRoundCheck, X } from 'lucide-react';
import {
  createAdminUser,
  getApiErrorMessage,
  type ManagedUserRole,
} from '../api/apiClient';

type AdminUserFormModalProps = {
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const roleOptions: {
  value: ManagedUserRole;
  label: string;
  description: string;
  Icon: typeof UserRoundCheck;
}[] = [
  {
    value: 'Beekeeper',
    label: 'Pcelar',
    description: 'Pristup pcelinjacima, kosnicama i uredjajima.',
    Icon: UserRoundCheck,
  },
  {
    value: 'Farmer',
    label: 'Farmer',
    description: 'Pristup parcelama, kulturama i tretiranjima.',
    Icon: Sprout,
  },
];

export default function AdminUserFormModal({ onClose, onSaved }: AdminUserFormModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<ManagedUserRole>('Beekeeper');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createAdminUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
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
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="admin-user-modal-title"
        aria-modal="true"
        className="modal-card admin-user-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="admin-user-modal-title">Novi korisnik</h2>
            <p>Korisnik aktivira nalog preko linka koji se salje emailom nakon kreiranja.</p>
          </div>
          <button
            aria-label="Zatvori"
            className="modal-close-button"
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-grid two">
            <label>
              Ime
              <span className="modal-input-shell">
                <User size={17} />
                <input
                  autoComplete="given-name"
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  type="text"
                  value={firstName}
                />
              </span>
            </label>

            <label>
              Prezime
              <span className="modal-input-shell">
                <User size={17} />
                <input
                  autoComplete="family-name"
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  type="text"
                  value={lastName}
                />
              </span>
            </label>
          </div>

          <label>
            Email
            <span className="modal-input-shell">
              <AtSign size={17} />
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label>
            Telefon
            <span className="modal-input-shell">
              <Phone size={17} />
              <input
                autoComplete="tel"
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
                type="tel"
                value={phoneNumber}
              />
            </span>
          </label>

          <fieldset className="role-choice-group">
            <legend>Uloga</legend>
            <div className="role-choice-grid">
              {roleOptions.map(({ value, label, description, Icon }) => (
                <label className={`role-choice-card${role === value ? ' selected' : ''}`} key={value}>
                  <input
                    checked={role === value}
                    onChange={() => setRole(value)}
                    type="radio"
                    value={value}
                  />
                  <span className="role-choice-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button orange-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Cuvanje...' : 'Kreiraj korisnika'}
          </button>
        </form>
      </section>
    </div>
  );
}
