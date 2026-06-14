import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { activateAccount, getApiErrorMessage } from '../api/apiClient';
import BrandLogo from '../components/BrandLogo';
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
      <section className="auth-layout-card auth-layout-card-wide">
        <header className="auth-layout-card-header">
          <div className="auth-layout-brand">
            <BrandLogo />
            <div className="auth-layout-brand-copy">
              <span className="auth-layout-eyebrow">Aktivacija naloga</span>
              <h1>SmartApiary</h1>
            </div>
          </div>
          <p className="auth-layout-subtitle">Kreirajte nalog i povežite svoj pčelinjak</p>
        </header>

        <p className="auth-layout-note">
          Aktivacioni link popunjava token automatski. Ako imas samo token, unesi ga ovdje i izaberi novu lozinku.
        </p>

        <form className="auth-layout-form" onSubmit={handleSubmit}>
          <label>
            Aktivacioni token
            <input
              autoComplete="one-time-code"
              onChange={(event) => setToken(event.target.value)}
              placeholder="Token iz aktivacionog linka"
              required
              type="text"
              value={token}
            />
          </label>

          <label>
            Lozinka
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <label>
            Potvrda lozinke
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button auth-layout-submit" disabled={isSubmitting} type="submit">
            <KeyRound size={18} />
            {isSubmitting ? 'Aktivacija...' : 'Aktiviraj'}
          </button>
        </form>

        <div className="auth-layout-links">
          <Link to="/login">Već imate nalog? Prijavite se</Link>
        </div>
      </section>
    </AuthLayout>
  );
}
