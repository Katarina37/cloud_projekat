// Stranica za slanje linka za novu lozinku.

import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CircleAlert, CircleCheck, Info, LoaderCircle, Mail, Send } from 'lucide-react';
import { forgotPassword, getApiErrorMessage } from '../api/apiClient';
import BrandLogo from '../components/BrandLogo';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import loginVideo from '../assets/auth/LoginVideo.mp4';

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
    <AuthLayout videoSrc={loginVideo}>
      <>
        <header className="auth-layout-card-header">
          <div className="auth-layout-brand">
            <BrandLogo />
            <div className="auth-layout-brand-copy">
              <span className="auth-layout-eyebrow">SmartApiary</span>
              <h1>Zaboravljena lozinka</h1>
            </div>
          </div>
          <p className="auth-layout-subtitle">
            Unesite email adresu naloga i poslacemo link za postavljanje nove lozinke.
          </p>
        </header>

        <div className="auth-layout-note">
          <Info size={18} aria-hidden="true" />
          <p>
            Link vazi ograniceno vreme. Ako poruka ne stigne odmah, proverite i spam folder.
          </p>
        </div>

        <form className="auth-layout-form" onSubmit={handleSubmit}>
          <AuthField
            autoComplete="email"
            icon={<Mail size={19} />}
            id="forgot-password-email"
            label="Email adresa"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ime@primer.com"
            required
            type="email"
            value={email}
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
              {isSubmitting ? <LoaderCircle className="auth-layout-spinner" size={18} /> : <Send size={18} />}
            </span>
            <span>{isSubmitting ? 'Slanje...' : 'Posalji link'}</span>
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
