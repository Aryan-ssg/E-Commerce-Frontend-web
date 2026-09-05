import { useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import { getProducts, getCategories } from '../../api/products';
import type { ProductResponse, Category, PagedResponse } from '../../types';

const inputCls =
  'rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
const btnCls =
  'cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50';

function ImageThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) {
    return <span className="text-sm text-text-muted">—</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-10 w-10 rounded-[var(--radius-md)] object-cover"
    />
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [createFile, setCreateFile] = useState<File | null>(null);

  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editBusy, setEditBusy] = useState(false);

  async function load() {
    setError('');
    try {
      const res: PagedResponse<ProductResponse> = await getProducts({ page, size: 20 });
      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load products');
    }
  }

  useEffect(() => {
    load();
    getCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, [page]);

  async function handleCreate() {
    setError('');
    if (categoryId === '' || !name.trim() || !price || !stock) {
      setError('Name, price, stock and category are required');
      return;
    }
    try {
      const created = await adminApi.createProduct(Number(categoryId), {
        productName: name.trim(),
        productPrice: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl.trim() || undefined,
      });
      if (createFile) {
        try {
          const updated = await adminApi.uploadProductImage(created.productId, createFile);
          setImageUrl(updated.imageUrl ?? '');
        } catch (e: any) {
          console.error('Image upload failed:', e?.response?.data ?? e?.message ?? e);
          setError('Product created but image upload failed: ' + (e?.response?.data?.message ?? e?.message ?? 'Unknown error'));
        }
      }
      setName('');
      setPrice('');
      setStock('');
      setImageUrl('');
      setCategoryId('');
      setCreateFile(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create product');
    }
  }

  async function handleUpdate() {
    if (!editing || editBusy) return;
    setEditBusy(true);
    setError('');
    try {
      await adminApi.updateProduct(editing.productId, {
        productName: editName.trim(),
        productPrice: Number(editPrice),
      });
      if (editFile) {
        try {
          await adminApi.uploadProductImage(editing.productId, editFile);
        } catch (e: any) {
          console.error('Image upload failed:', e?.response?.data ?? e?.message ?? e);
          setError('Product updated but image upload failed: ' + (e?.response?.data?.message ?? e?.message ?? 'Unknown error'));
        }
      }
      setEditing(null);
      setEditFile(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update product');
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete(p: ProductResponse) {
    if (!confirm(`Delete product "${p.productName}"?`)) return;
    setError('');
    try {
      await adminApi.deleteProduct(p.productId);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete product');
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-extrabold text-text">Products</h2>
      <p className="mb-5 text-sm text-text-secondary">Manage your product catalog.</p>

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="mb-5 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <h3 className="m-0 mb-3 text-sm font-semibold text-text-secondary">New product</h3>
        <div className="flex flex-wrap items-end gap-2">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
          <input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            {createFile ? createFile.name : 'Image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => setCreateFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button onClick={handleCreate} className="cursor-pointer rounded-[var(--radius-md)] bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
            Create
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Image</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId} className="border-b border-border/50 transition-colors hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-text-secondary">{p.productId}</td>
                <td className="px-4 py-3">
                  {editing?.productId === p.productId ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
                  ) : (
                    <span className="text-sm font-medium text-text">{p.productName}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing?.productId === p.productId ? (
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={inputCls} />
                  ) : (
                    <span className="text-sm text-text">₹{p.productPrice}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{p.categoryName}</td>
                <td className="px-4 py-3">
                  {editing?.productId === p.productId ? (
                    <div className="flex items-center gap-2">
                      <ImageThumbnail src={p.imageUrl} alt={p.productName} />
                      <label className="cursor-pointer inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-slate-50">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        {editFile ? editFile.name : 'Change'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </div>
                  ) : (
                    <ImageThumbnail src={p.imageUrl} alt={p.productName} />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editing?.productId === p.productId ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={handleUpdate} disabled={editBusy} className="cursor-pointer rounded-[var(--radius-md)] bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
                        {editBusy ? 'Saving…' : 'Save'}
                      </button>
                      <button onClick={() => { setEditing(null); setEditFile(null); }} className={btnCls}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setEditName(p.productName);
                          setEditPrice(String(p.productPrice));
                          setEditFile(null);
                        }}
                        className={btnCls}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="cursor-pointer rounded-[var(--radius-md)] border border-error/30 bg-surface px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-light"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-text-muted" colSpan={6}>
                  No products yet
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
