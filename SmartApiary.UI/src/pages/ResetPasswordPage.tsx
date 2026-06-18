// Stranica za postavljanje nove lozinke.

import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CircleAlert, CircleCheck, Info, Key, KeyRound, LoaderCircle, Lock } from 'lucide-react';
import { getApiErrorMessage, resetPassword } from '../api/apiClient';
import BrandLogo from '../components/BrandLogo';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import registerVideo from '../assets/auth/RegisterVideo.mp4';

export default function ResetPasswordPage() {
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
      await resetPassword({ token, password, confirmPassword });
      setSuccessMessage('Lozinka je promenjena. Mozete se prijaviti.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Promena lozinke nije uspela.'));
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
              <h1>Nova lozinka</h1>
            </div>
          </div>
          <p className="auth-layout-subtitle">
            Unesite token iz email poruke i izaberite novu lozinku za nalog.
          </p>
        </header>

        <div className="auth-layout-note">
          <Info size={18} aria-hidden="true" />
          <p>
            Ako ste otvorili link iz emaila, token je vec popunjen. Lozinka mora imati najmanje 8 znakova.
          </p>
        </div>

        <form className="auth-layout-form" onSubmit={handleSubmit}>
          <AuthField
            autoComplete="one-time-code"
            icon={<Key size={19} />}
            id="reset-password-token"
            label="Token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token iz email poruke"
            required
            type="text"
            value={token}
          />

          <AuthField
            autoComplete="new-password"
            icon={<Lock size={19} />}
            id="reset-password-new"
            label="Nova lozinka"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Unesite novu lozinku"
            required
            type="password"
            value={password}
          />

          <AuthField
            autoComplete="new-password"
            icon={<Lock size={19} />}
            id="reset-password-confirmation"
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
            <span>{isSubmitting ? 'Cuvanje...' : 'Sacuvaj lozinku'}</span>
          </button>
        </form>

        <div className="auth-layout-links">
          <Link className="auth-layout-switch-link" to="/login">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Nazad na prijavu</span>
          </Link>
        </div>
      </>
    </AuthLayout>
  );
}
