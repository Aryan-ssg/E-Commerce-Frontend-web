import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../api/products';
import type { Category } from '../types';

function SkeletonCategory() {
  return (
    <div className="animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="h-28 rounded-t-[var(--radius-lg)] bg-slate-200" />
      <div className="p-4">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  );
}

// deterministic pastel for initial letter background
function bgForId(id: number) {
  const palettes = [
    'bg-[#eef2ff] text-[#4338ca]', // brand-light
    'bg-[#fef3c7] text-[#d97706]', // warning-light
    'bg-[#ecfdf5] text-[#059669]', // success-light
    'bg-[#fff1f2] text-[#e11d48]', // error-light
    'bg-[#f0f9ff] text-[#0284c7]',
    'bg-[#fdf4ff] text-[#a21caf]',
  ];
  return palettes[id % palettes.length];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  const handleBrowse = (c: Category) => {
    // Deep-link to catalog filtered by category — Catalog reads ?categoryId=
    navigate(`/?categoryId=${c.categoryId}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-text">Categories</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Browse by category — each card shows how many products it holds.
          </p>
        </div>
        <Link
          to="/"
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark hover:underline sm:mt-0"
        >
          View all products
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}{' '}
          <button onClick={() => window.location.reload()} className="ml-1 font-medium underline">
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCategory key={i} />
          ))}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text">No categories yet</h3>
          <p className="mt-1 text-sm text-text-secondary">Categories will appear here once an admin creates them.</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => {
            const count = c.products?.length ?? 0;
            const bg = bgForId(c.categoryId);
            return (
              <button
                key={c.categoryId}
                onClick={() => handleBrowse(c)}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-dropdown)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer"
              >
                <div className={`relative flex h-28 items-center justify-center ${bg} transition-colors`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-white/90 text-xl font-extrabold shadow-sm ring-1 ring-black/5">
                    {c.categoryName.charAt(0).toUpperCase()}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary shadow-sm ring-1 ring-black/5">
                    {count} {count === 1 ? 'product' : 'products'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="m-0 text-base font-semibold leading-snug text-text group-hover:text-brand truncate">
                    {c.categoryName}
                  </h3>
                  <p className="m-0 text-xs text-text-muted line-clamp-1">
                    {count > 0 ? c.products.slice(0, 2).map((p) => p.productName).join(' · ') : 'No products yet'}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-1.5 transition-all">
                    Browse
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
