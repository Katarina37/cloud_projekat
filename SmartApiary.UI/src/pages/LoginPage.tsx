import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { getApiErrorMessage, login } from '../api/apiClient';
import { setAuthToken, setCurrentUserEmail } from '../auth/authStorage';
import BrandLogo from '../components/BrandLogo';
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
      <section className="auth-layout-card">
        <header className="auth-layout-card-header">
          <div className="auth-layout-brand">
            <BrandLogo />
            <div className="auth-layout-brand-copy">
              <span className="auth-layout-eyebrow">Prijava</span>
              <h1>SmartApiary</h1>
            </div>
          </div>
          <p className="auth-layout-subtitle">Dobrodošli nazad u pametni pčelinjak</p>
        </header>

        <p className="auth-layout-note">
          Prijava radi nakon aktivacije naloga. Ako prvi put ulazis u sistem, otvori aktivacioni link iz pozivnice i
          postavi lozinku.
        </p>

        <form className="auth-layout-form" onSubmit={handleSubmit}>
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
            Lozinka
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button auth-layout-submit" disabled={isSubmitting} type="submit">
            <LogIn size={18} />
            {isSubmitting ? 'Prijava...' : 'Prijavi se'}
          </button>
        </form>

        <div className="auth-layout-links">
          <Link to="/forgot-password">Zaboravljena lozinka</Link>
          <Link to="/activate">Novi korisnik? Aktiviraj nalog</Link>
        </div>
      </section>
    </AuthLayout>
  );
}
