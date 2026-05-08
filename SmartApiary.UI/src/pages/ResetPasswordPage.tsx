import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { getApiErrorMessage, resetPassword } from '../api/apiClient';
import BrandLogo from '../components/BrandLogo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
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
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand auth-brand">
          <BrandLogo />
          <div>
            <strong>Nova lozinka</strong>
            <span>Smart Apiary</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Token
            <input onChange={(event) => setToken(event.target.value)} required type="text" value={token} />
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

          <button className="primary-button orange-button" disabled={isSubmitting} type="submit">
            <KeyRound size={18} />
            {isSubmitting ? 'Cuvanje...' : 'Sacuvaj'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Nazad na prijavu</Link>
        </div>
      </section>
    </main>
  );
}
