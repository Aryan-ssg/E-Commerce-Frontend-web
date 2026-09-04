import { useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import type { AdminUser, PagedResponse } from '../../types';

const inputCls =
  'rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
const btnCls =
  'cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const res: PagedResponse<AdminUser> = await adminApi.getUsers({
        username: username || undefined,
        role: role || undefined,
        page,
        size: 20,
      });
      setUsers(res.content);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load users');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <h2 className="mb-1 text-2xl font-extrabold text-text">Users</h2>
      <p className="mb-5 text-sm text-text-secondary">Manage user accounts and roles.</p>

      {/* Search */}
      <div className="mb-5 flex flex-wrap gap-2">
        <input
          placeholder="Search by username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputCls}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          onClick={() => {
            setPage(0);
            load();
          }}
          className={btnCls}
        >
          Search
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Username</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} className="border-b border-border/50 transition-colors hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-text-secondary">{u.userId}</td>
                <td className="px-4 py-3 text-sm font-medium text-text">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.role === 'ADMIN' ? 'bg-brand-light text-brand' : 'bg-slate-100 text-text-secondary'
                  }`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-text-muted" colSpan={3}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className={btnCls}>
            Prev
          </button>
          <span className="min-w-[80px] text-center text-sm text-text-secondary">
            {page + 1} / {totalPages}
          </span>
          <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} className={btnCls}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
