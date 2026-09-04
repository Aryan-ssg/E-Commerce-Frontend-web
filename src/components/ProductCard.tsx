import { useEffect, useState } from 'react';
import type { ProductResponse } from '../types';
import { addToCart } from '../api/cart';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './Toast';

export default function ProductCard({ product }: { product: ProductResponse }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);
  // Reset when imageUrl changes
  useEffect(() => { setImgFailed(false); }, [product.imageUrl]);
  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;




  const placeholderSrc = `/products/ph${(product.productId % 12) + 1}.svg`;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'error');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await addToCart(product.productId, 1);
      if (response.itemAlreadyInCart) {
        showToast(`${product.productName} quantity updated in cart`, 'info');
      } else {
        showToast(`${product.productName} added to cart`, 'success');
      }
    } catch {
      setError('Could not add to cart');
      showToast('Could not add to cart', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface transition-colors duration-150 hover:border-brand/40">
      <div className="relative aspect-square overflow-hidden rounded-t-[var(--radius-lg)] border-b border-border bg-stone-100">
        <img
          src={product.imageUrl && !imgFailed ? product.imageUrl : placeholderSrc}
          alt={product.productName}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-0 top-3 border border-l-0 border-border bg-surface/95 py-0.5 pl-2 pr-2.5 text-[11px] font-medium text-text-secondary">
          {product.categoryName}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="m-0 text-base font-semibold leading-snug text-text">
          {product.productName}
        </h3>
        <p className="m-0 mt-auto font-[var(--font-heading)] text-lg font-semibold text-accent">
          ₹{product.productPrice}
        </p>
        <p className={`m-0 text-xs font-medium ${isOutOfStock ? 'text-error' : isLowStock ? 'text-warning' : 'text-success'
          }`} >
          {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} left` : 'In Stock'}

        </p>
        <button
          onClick={handleAdd}
          disabled={busy || isOutOfStock}
          className="mt-1 w-full cursor-pointer rounded-[var(--radius-sm)] bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Adding…' : 'Add to cart'}
        </button>
        {error && (
          <p className="m-0 text-xs text-error">{error}</p>
        )}
      </div>
    </div>
  );
}