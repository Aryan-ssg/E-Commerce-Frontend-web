import { useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import { getCategories } from '../../api/products';
import type { Category } from '../../types';

const inputCls =
  'rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
const btnCls =
  'cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  async function load() {
    try {
      setCategories(await getCategories());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load categories');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    setError('');
    if (!name.trim()) return;
    try {
      await adminApi.createCategory({ categoryName: name.trim() });
      setName('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create category');
    }
  }

  async function handleUpdate() {
    if (!editing) return;
    setError('');
    try {
      await adminApi.updateCategory(editing.categoryId, { categoryName: editName.trim() });
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update category');
    }
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Delete category "${c.categoryName}"?`)) return;
    setError('');
    try {
      await adminApi.deleteCategory(c.categoryId);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete category');
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-extrabold text-text">Categories</h2>
      <p className="mb-5 text-sm text-text-secondary">Organize your products into categories.</p>

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="mb-5 flex gap-2">
        <input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className={inputCls}
        />
        <button onClick={handleCreate} className="cursor-pointer rounded-[var(--radius-md)] bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
          Add
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Products</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.categoryId} className="border-b border-border/50 transition-colors hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-text-secondary">{c.categoryId}</td>
                <td className="px-4 py-3">
                  {editing?.categoryId === c.categoryId ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      className={inputCls}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-text">{c.categoryName}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{c.products?.length ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  {editing?.categoryId === c.categoryId ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={handleUpdate} className="cursor-pointer rounded-[var(--radius-md)] bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className={btnCls}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setEditName(c.categoryName);
                        }}
                        className={btnCls}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="cursor-pointer rounded-[var(--radius-md)] border border-error/30 bg-surface px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-light"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-text-muted" colSpan={4}>
                  No categories yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
