import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md px-4">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-text">Welcome back</h2>
          <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-text">
              Username
            </label>
            <input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-text">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
          </div>
          {error && (
            <div className="rounded-[var(--radius-md)] border border-error/20 bg-error-light px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 w-full cursor-pointer rounded-[var(--radius-md)] bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-text-secondary">
          No account?{' '}
          <Link to="/register" className="font-medium text-brand hover:text-brand-dark hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
