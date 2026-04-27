import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { forgotPassword, getApiErrorMessage } from '../api/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      setSuccessMessage('Ako nalog postoji, poslat je reset link.');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Reset zahtev nije uspeo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <Mail size={22} />
          </div>
          <div>
            <strong>Zaboravljena lozinka</strong>
            <span>Smart Apiary</span>
          </div>
        </div>

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

          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button orange-button" disabled={isSubmitting} type="submit">
            <Mail size={18} />
            {isSubmitting ? 'Slanje...' : 'Posalji link'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Nazad na prijavu</Link>
        </div>
      </section>
    </main>
  );
}
