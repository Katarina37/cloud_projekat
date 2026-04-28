import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { getApiErrorMessage, login } from '../api/apiClient';
import { setAuthToken } from '../auth/authStorage';

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
      navigate('/pregled', { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Neuspesna prijava.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <LogIn size={22} />
          </div>
          <div>
            <strong>Smart Apiary</strong>
            <span>Prijava</span>
          </div>
        </div>
        <p className="auth-note">
          Prijava radi nakon aktivacije naloga. Ako prvi put ulazis u sistem, otvori aktivacioni link iz pozivnice i
          postavi lozinku.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <button className="primary-button orange-button" disabled={isSubmitting} type="submit">
            <LogIn size={18} />
            {isSubmitting ? 'Prijava...' : 'Prijavi se'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Zaboravljena lozinka</Link>
          <Link to="/activate">Imam aktivacioni token</Link>
        </div>
      </section>
    </main>
  );
}
