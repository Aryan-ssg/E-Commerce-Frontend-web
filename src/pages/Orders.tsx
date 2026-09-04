import { useEffect, useState } from 'react';
import { getMyOrders, cancelOrder } from '../api/orders';
import type { GetOrderByIdResponse } from '../types';

const CANCELLABLE = new Set(['PENDING', 'PAID']);

function statusBadge(status: string) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
  switch (status) {
    case 'CANCELLED':
      return `${base} bg-error-light text-error`;
    case 'DELIVERED':
      return `${base} bg-success-light text-success`;
    case 'PAID':
      return `${base} bg-success-light text-success`;
    case 'PENDING':
      return `${base} bg-warning-light text-warning`;
    default:
      return `${base} bg-brand-light text-brand`;
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<GetOrderByIdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getMyOrders()
      .then(setOrders)
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      load();
    } catch {
      setError('Could not cancel order');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm text-text-secondary">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-md border border-error/20 bg-error-light px-4 py-3 text-sm text-error">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text">No orders yet</h3>
        <p className="mt-1 text-sm text-text-secondary">Your order history will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold text-text">My Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div key={o.orderId} className="rounded-lg border border-border bg-surface p-5 shadow-(--shadow-card)">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h3 className="m-0 text-base font-semibold text-text">Order #{o.orderId}</h3>
                <span className={statusBadge(o.orderStatus)}>{o.orderStatus}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>
                  {new Date(o.orderDateTime).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="h-3.5 w-px bg-border" />
                <span className="font-semibold text-text">{"\u20B9"}{o.totalPrice}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
              {o.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    Product #{item.productId} <span className="text-text-muted">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-text">₹{item.priceAtCheckout}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-start justify-between border-t border-border pt-3">
              <p className="m-0 text-xs text-text-secondary">
                Ship to: {[o.addressLine, o.landmark, `PIN ${o.pinCode}`].filter(Boolean).join(', ')}
              </p>
              <p className="m-0 text-xs text-text-secondary">
                Contact: {o.contactNumber}
              </p>
              {CANCELLABLE.has(o.orderStatus) && (
                <button
                  onClick={() => handleCancel(o.orderId)}
                  className="shrink-0 cursor-pointer rounded-sm border border-error/30 bg-surface px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-light"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}