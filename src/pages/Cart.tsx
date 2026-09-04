import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cart';
import type { CartResponse } from '../types';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getCart()
      .then(setCart)
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeQty = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = await updateCartItem(productId, quantity);
    setCart(updated);
  };

  const remove = async (productId: number) => {
    const updated = await removeCartItem(productId);
    setCart(updated);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm text-text-secondary">Loading your cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.336-1.872l1.836-8.328M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text">Your cart is empty</h3>
        <p className="mt-1 text-sm text-text-secondary">Add some products to get started.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-[var(--radius-md)] bg-brand px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-brand-dark"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold text-text">Cart</h1>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        {/* Items */}
        <div className="flex-1">
          <div className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <h3 className="m-0 text-base font-semibold text-text">{item.productName}</h3>
                  <p className="m-0 mt-0.5 text-sm text-text-secondary">₹{item.unitPrice} each</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => changeQty(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface text-text-secondary transition-colors hover:bg-slate-50 disabled:opacity-40"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-text">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.productId, item.quantity + 1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface text-text-secondary transition-colors hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-24 text-right text-sm font-bold text-text">₹{item.lineTotal}</span>
                  <button
                    onClick={() => remove(item.productId)}
                    className="cursor-pointer border-0 bg-transparent text-sm font-medium text-error transition-colors hover:text-error/80"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-72">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <h3 className="m-0 mb-4 text-lg font-semibold text-text">Order summary</h3>
            <div className="mb-4 flex items-center justify-between text-sm text-text-secondary">
              <span>Subtotal ({cart.items.length} items)</span>
              <span className="font-medium text-text">₹{cart.totalPrice}</span>
            </div>
            <div className="mb-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-base font-bold text-text">Total</span>
              <span className="text-xl font-extrabold text-brand">₹{cart.totalPrice}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full cursor-pointer rounded-[var(--radius-md)] bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Proceed to checkout
            </button>
            <button
              onClick={() => clearCart().then(load)}
              className="mt-2 w-full cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
