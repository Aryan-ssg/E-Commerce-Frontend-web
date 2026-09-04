import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { getPasswordStrength } from '../utils/passwordStrength';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const strength = getPasswordStrength(password);
  const isAtLeastFair = strength.score >= 2;
  const isPasswordValid = isAtLeastFair;
  const passwordsMatch = password === confirmPassword;
  const isConfirmValid = confirmPassword.length > 0 && passwordsMatch;
  const isFormValid = username.trim().length > 0 && isPasswordValid && isConfirmValid && !busy;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
      } else {
        setError("Password must be at least 'Fair' strength — use at least 2 of: lowercase, uppercase, number, special character");
      }
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await register(username, password);
      setMessage('Registered successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1000);
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message as string | undefined;
      if (serverMsg?.toLowerCase().includes('fair') || serverMsg?.toLowerCase().includes('password')) {
        setError(serverMsg);
      } else {
        setError('Registration failed (username may already be taken)');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md px-4">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-text">Create an account</h2>
          <p className="mt-1 text-sm text-text-secondary">Join Shop and start shopping</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="reg-username" className="mb-1.5 block text-sm font-medium text-text">
              Username
            </label>
            <input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-text">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (Fair strength required)"
                required
                minLength={8}
                aria-describedby="reg-password-help"
                aria-invalid={password.length > 0 && !isPasswordValid}
                className={`w-full rounded-[var(--radius-md)] border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 ${
                  password.length > 0 && !isPasswordValid
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : password.length > 0 && strength.score >= 2
                      ? 'border-success focus:border-success focus:ring-success/20'
                      : 'border-border focus:border-brand focus:ring-brand/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.59 9.59 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p id="reg-password-help" className="mt-1.5 text-xs text-text-muted">
              Must be at least <span className="font-medium text-warning">Fair</span> strength — 8+ characters with at least 2 of: lowercase, uppercase, number, special character.
            </p>
            <PasswordStrengthMeter password={password} />
            {password.length > 0 && !isPasswordValid && (
              <p className="mt-1.5 text-xs font-medium text-error">
                {password.length < 8
                  ? 'Password must be at least 8 characters.'
                  : "Weak password — add another character type to reach 'Fair' (e.g. add a number or uppercase)."}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-text">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                className={`w-full rounded-[var(--radius-md)] border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 ${
                  confirmPassword.length > 0 && !passwordsMatch
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : confirmPassword.length > 0 && passwordsMatch && isPasswordValid
                      ? 'border-success focus:border-success focus:ring-success/20'
                      : 'border-border focus:border-brand focus:ring-brand/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
              >
                {showConfirm ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.59 9.59 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`mt-1.5 text-xs font-medium ${passwordsMatch ? 'text-success' : 'text-error'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>
          {error && (
            <div className="rounded-[var(--radius-md)] border border-error/20 bg-error-light px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-[var(--radius-md)] border border-success/20 bg-success-light px-3 py-2 text-sm text-success">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid}
            title={
              !isPasswordValid && password.length > 0
                ? password.length < 8
                  ? 'Password must be at least 8 characters'
                  : "Password must be at least 'Fair' strength"
                : confirmPassword.length > 0 && !passwordsMatch
                  ? 'Passwords do not match'
                  : !username.trim()
                    ? 'Username is required'
                    : undefined
            }
            className="mt-1 w-full cursor-pointer rounded-[var(--radius-md)] bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:text-brand-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
