// Stranica za prijavu.

import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleAlert, Info, LoaderCircle, Lock, LogIn, Mail } from 'lucide-react';
import { getApiErrorMessage, login } from '../api/apiClient';
import { setAuthToken, setCurrentUserEmail } from '../auth/authStorage';
import BrandLogo from '../components/BrandLogo';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import loginVideo from '../assets/auth/LoginVideo.mp4';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });

      if (!response.token) {
        throw new Error('Token nije vracen.');
      }

      setAuthToken(response.token);
      setCurrentUserEmail(response.email);
      navigate('/pregled', { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Neuspesna prijava.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout videoSrc={loginVideo}>
      <>
        <header className="auth-layout-card-header">
          <div className="auth-layout-brand">
            <BrandLogo />
            <div className="auth-layout-brand-copy">
              <span className="auth-layout-eyebrow">SmartApiary</span>
              <h1>Dobrodošli nazad</h1>
            </div>
          </div>
          <p className="auth-layout-subtitle">
            Prijavite se i nastavite upravljati svojim pametnim pčelinjakom.
          </p>
        </header>

        <div className="auth-layout-note">
          <Info size={18} aria-hidden="true" />
          <p>
            Prvi put ulazite u sistem? Otvorite aktivacioni link iz pozivnice i prvo postavite lozinku.
          </p>
        </div>

        <form className="auth-layout-form" onSubmit={handleSubmit}>
          <AuthField
            autoComplete="email"
            icon={<Mail size={19} />}
            id="login-email"
            label="Email adresa"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ime@primjer.com"
            required
            type="email"
            value={email}
          />

          <AuthField
            autoComplete="current-password"
            icon={<Lock size={19} />}
            id="login-password"
            label="Lozinka"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Unesite lozinku"
            required
            type="password"
            value={password}
          />

          {error ? (
            <p className="form-error auth-layout-message" role="alert">
              <CircleAlert size={17} aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <button className="auth-layout-submit" disabled={isSubmitting} type="submit">
            <span className="auth-layout-submit-icon" aria-hidden="true">
              {isSubmitting ? <LoaderCircle className="auth-layout-spinner" size={18} /> : <LogIn size={18} />}
            </span>
            <span>{isSubmitting ? 'Prijava...' : 'Prijavi se'}</span>
          </button>
        </form>

        <div className="auth-layout-links">
          <Link to="/forgot-password">Zaboravili ste lozinku?</Link>
          <Link className="auth-layout-switch-link" to="/activate">
            Novi korisnik? <span>Aktivirajte nalog</span>
          </Link>
        </div>
      </>
    </AuthLayout>
  );
}
