import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/products';
import type { Category, ProductResponse } from '../types';
import ProductCard from '../components/ProductCard';

const PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="aspect-square rounded-t-[var(--radius-lg)] bg-slate-200" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-3 w-16 rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-20 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-[var(--radius-md)] bg-slate-200" />
      </div>
    </div>
  );
}

export default function Catalog() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(() => {
    const v = searchParams.get('categoryId');
    return v ? Number(v) : null;
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  }, []);

  // Keep state in sync with URL (back/forward, search from Navbar, and /categories)
  useEffect(() => {
    const v = searchParams.get('categoryId');
    setSelectedCategory(v ? Number(v) : null);
    setPage(0);
  }, [searchParams]);

  const handleSelectCategory = (categoryId: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (categoryId === null) next.delete('categoryId');
    else next.set('categoryId', String(categoryId));
    setSearchParams(next);
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('name');
    setSearchParams(next);
  };

  const searchName = searchParams.get('name')?.trim() ?? '';
  const isSearching = searchName.length > 0;

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts({ name: searchName || undefined, categoryId: selectedCategory ?? undefined, page, size: PAGE_SIZE })
      .then((res) => {
        setProducts(res.content);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [selectedCategory, page, searchName]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-text">Products</h1>
        <p className="mt-1 text-sm text-text-secondary">Browse the catalog and add items to your cart.</p>
        {isSearching && !loading && (
          <p className="mt-2 text-sm text-text-secondary">
            Showing results for <span className="font-semibold text-text">"{searchName}"</span>
            {selectedCategory !== null && categories.find((c) => c.categoryId === selectedCategory) && (
              <> in <span className="font-semibold text-text">{categories.find((c) => c.categoryId === selectedCategory)?.categoryName}</span></>
            )}
          </p>
        )}
      </div>

      {/* Active filters */}
      {isSearching && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand-light px-3 py-1.5 text-xs font-medium text-brand">
            Search: "{searchName}"
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="ml-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white text-brand transition-colors hover:bg-brand hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </span>
          <button
            onClick={clearSearch}
            className="cursor-pointer text-xs font-medium text-text-muted underline hover:text-text"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleSelectCategory(null)}
          className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            selectedCategory === null
              ? 'border-brand bg-brand text-white'
              : 'border-border bg-surface text-text-secondary hover:border-slate-300 hover:text-text'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.categoryId}
            onClick={() => handleSelectCategory(c.categoryId)}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              selectedCategory === c.categoryId
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-surface text-text-secondary hover:border-slate-300 hover:text-text'
            }`}
          >
            {c.categoryName}
          </button>
        ))}
        <Link
          to="/categories"
          className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
        >
          Browse categories
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && !error && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text">
            {isSearching ? `No results for "${searchName}"` : 'No products found'}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {isSearching ? (
              <>
                Try a different keyword or{' '}
                <button onClick={clearSearch} className="font-medium text-brand underline hover:text-brand-dark">
                  clear search
                </button>
                {selectedCategory !== null && ' or change category'}.
              </>
            ) : (
              'Try selecting a different category.'
            )}
          </p>
          {isSearching && (
            <button
              onClick={clearSearch}
              className="mt-4 cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-slate-50"
            >
              Clear search and show all
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="min-w-[80px] text-center text-sm text-text-secondary">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
