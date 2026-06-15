// Stranica za aktivaciju naloga.

import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleAlert, CircleCheck, Info, Key, KeyRound, LoaderCircle, Lock } from 'lucide-react';
import { activateAccount, getApiErrorMessage } from '../api/apiClient';
import BrandLogo from '../components/BrandLogo';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import registerVideo from '../assets/auth/RegisterVideo.mp4';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju.');
      return;
    }

    setIsSubmitting(true);

    try {
      await activateAccount({ token, password, confirmPassword });
      setSuccessMessage('Nalog je aktiviran. Mozete se prijaviti.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Aktivacija naloga nije uspela.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout videoSrc={registerVideo}>
      <>
        <header className="auth-layout-card-header">
          <div className="auth-layout-brand">
            <BrandLogo />
            <div className="auth-layout-brand-copy">
              <span className="auth-layout-eyebrow">SmartApiary</span>
              <h1>Aktivirajte nalog</h1>
            </div>
          </div>
          <p className="auth-layout-subtitle">
            Postavite lozinku i napravite prvi korak ka svom pametnom pčelinjaku.
          </p>
        </header>

        <div className="auth-layout-note">
          <Info size={18} aria-hidden="true" />
          <p>
            Aktivacioni link automatski popunjava token. Ako imate samo token, unesite ga ispod.
          </p>
        </div>

        <form className="auth-layout-form" onSubmit={handleSubmit}>
          <AuthField
            autoComplete="one-time-code"
            icon={<Key size={19} />}
            id="activation-token"
            label="Aktivacioni token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token iz aktivacionog linka"
            required
            type="text"
            value={token}
          />

          <AuthField
            autoComplete="new-password"
            helperText="Koristite najmanje 8 znakova."
            icon={<Lock size={19} />}
            id="activation-password"
            label="Nova lozinka"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Kreirajte sigurnu lozinku"
            required
            type="password"
            value={password}
          />

          <AuthField
            autoComplete="new-password"
            icon={<Lock size={19} />}
            id="activation-password-confirmation"
            label="Potvrdite lozinku"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Ponovite novu lozinku"
            required
            type="password"
            value={confirmPassword}
          />

          {successMessage ? (
            <p className="form-success auth-layout-message" role="status">
              <CircleCheck size={17} aria-hidden="true" />
              {successMessage}
            </p>
          ) : null}
          {error ? (
            <p className="form-error auth-layout-message" role="alert">
              <CircleAlert size={17} aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <button className="auth-layout-submit" disabled={isSubmitting} type="submit">
            <span className="auth-layout-submit-icon" aria-hidden="true">
              {isSubmitting ? <LoaderCircle className="auth-layout-spinner" size={18} /> : <KeyRound size={18} />}
            </span>
            <span>{isSubmitting ? 'Aktivacija...' : 'Aktiviraj'}</span>
          </button>
        </form>

        <div className="auth-layout-links">
          <Link className="auth-layout-switch-link" to="/login">
            Već imate nalog? <span>Prijavite se</span>
          </Link>
        </div>
      </>
    </AuthLayout>
  );
}
