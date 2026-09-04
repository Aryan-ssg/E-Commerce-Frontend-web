import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function PrivateRoute({
  children,
  requireRoles,
}: {
  children: ReactNode;
  requireRoles?: string[];
}) {
  const { isAuthenticated, roles } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireRoles && !requireRoles.some((r) => roles.includes(r))) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-light">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text">403 — Access denied</h2>
        <p className="mt-2 text-text-secondary">You don't have permission to view this page.</p>
      </div>
    );
  }
  return <>{children}</>;
}
