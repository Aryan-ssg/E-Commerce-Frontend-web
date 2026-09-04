import { useState } from 'react';
import * as adminApi from '../../api/admin';
import type { GetOrderByIdResponse, OrderStatus } from '../../types';

const STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const inputCls =
  'rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
const btnCls =
  'cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50';

function statusBadge(status: string) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
  switch (status) {
    case 'CANCELLED':
      return `${base} bg-error-light text-error`;
    case 'DELIVERED':
    case 'PAID':
      return `${base} bg-success-light text-success`;
    case 'PENDING':
      return `${base} bg-warning-light text-warning`;
    default:
      return `${base} bg-brand-light text-brand`;
  }
}

export default function AdminOrders() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<GetOrderByIdResponse | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setOrder(null);
    const id = Number(orderId);
    if (!id) {
      setError('Enter a numeric order ID');
      return;
    }
    try {
      const o = await adminApi.getOrderById(id);
      setOrder(o);
      setNewStatus('');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Order not found');
    }
  }

  async function handleUpdate() {
    if (!order || newStatus === '') return;
    setError('');
    try {
      const o = await adminApi.updateOrderStatus(order.orderId, newStatus);
      setOrder(o);
      setNewStatus('');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update status');
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-extrabold text-text">Orders</h2>
      <p className="mb-5 text-sm text-text-secondary">Look up and manage order statuses.</p>

      {/* Search */}
      <div className="mb-5 flex gap-2">
        <input
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className={inputCls}
        />
        <button onClick={handleSearch} className={btnCls}>
          Lookup
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {order && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h3 className="m-0 text-lg font-semibold text-text">Order #{order.orderId}</h3>
              <span className={statusBadge(order.orderStatus)}>{order.orderStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className={inputCls}
              >
                <option value="">Change status…</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                disabled={newStatus === ''}
                onClick={handleUpdate}
                className="cursor-pointer rounded-[var(--radius-md)] bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-text-muted">Total</p>
              <p className="m-0 mt-1 text-lg font-bold text-text">₹{order.totalPrice}</p>
            </div>
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-text-muted">Ship to</p>
              <p className="m-0 mt-1 text-sm text-text-secondary">
                {[order.addressLine, order.landmark, `PIN ${order.pinCode}`].filter(Boolean).join(', ')}
              </p>
              <p className="m-0 mt-1 text-sm text-text-secondary">
                {order.contactNumber}
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Product</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Qty</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((it, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="px-4 py-2.5 text-sm text-text-secondary">#{it.productId}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{it.quantity}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-text">₹{it.priceAtCheckout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
