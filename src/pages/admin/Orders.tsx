import { Fragment, useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import type { AdminOrder, GetOrderByIdResponse, OrderStatus } from '../../types';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const ALL_STATUSES: OrderStatus[] = [
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
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GetOrderByIdResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [updateBusy, setUpdateBusy] = useState(false);

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<GetOrderByIdResponse | null>(null);
  const [searchError, setSearchError] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getAllOrders({ page, size: 15 });
      setOrders(res.content);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page]);

  async function handleExpand(orderId: number) {
    if (expandedId === orderId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(orderId);
    setDetailLoading(true);
    setNewStatus('');
    setSearchResult(null);
    try {
      const o = await adminApi.getOrderById(orderId);
      setDetail(o);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdateStatus(target?: GetOrderByIdResponse) {
    const src = target ?? detail;
    if (!src || newStatus === '' || updateBusy) return;
    setUpdateBusy(true);
    setError('');
    try {
      await adminApi.updateOrderStatus(src.orderId, newStatus);
      setDetail({ ...src, orderStatus: newStatus as OrderStatus });
      setNewStatus('');
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update status');
    } finally {
      setUpdateBusy(false);
    }
  }

  async function handleSearch() {
    setSearchError('');
    setSearchResult(null);
    setExpandedId(null);
    const id = Number(searchId);
    if (!id) {
      setSearchError('Enter a numeric order ID');
      return;
    }
    try {
      const o = await adminApi.getOrderById(id);
      setSearchResult(o);
    } catch (e: any) {
      setSearchError(e?.response?.data?.message ?? 'Order not found');
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-extrabold text-text">Orders</h2>
      <p className="mb-5 text-sm text-text-secondary">View and manage all customer orders.</p>

      <div className="mb-5 flex gap-2">
        <input
          placeholder="Search by Order ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className={inputCls}
        />
        <button onClick={handleSearch} className={btnCls}>
          Lookup
        </button>
      </div>

      {searchError && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {searchError}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {searchResult && (
        <div className="mb-5 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <DetailPanel
            order={searchResult}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            onUpdate={() => handleUpdateStatus(searchResult)}
            updateBusy={updateBusy}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">Loading…</td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">No orders found</td>
              </tr>
            )}
            {orders.map((o) => (
              <Fragment key={o.orderId}>
                <tr
                  onClick={() => handleExpand(o.orderId)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 text-sm text-text-secondary">#{o.orderId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text">{o.username}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text">₹{o.totalPrice}</td>
                  <td className="px-4 py-3"><span className={statusBadge(o.orderStatus)}>{o.orderStatus}</span></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {new Date(o.orderDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-brand">{expandedId === o.orderId ? '▲' : '▼'}</span>
                  </td>
                </tr>
                {expandedId === o.orderId && (
                  <tr>
                    <td colSpan={6} className="border-b border-border bg-stone-50 px-6 py-4">
                      {detailLoading ? (
                        <p className="text-sm text-text-muted">Loading details…</p>
                      ) : detail ? (
                        <DetailPanel
                          order={detail}
                          newStatus={newStatus}
                          setNewStatus={setNewStatus}
                          onUpdate={() => handleUpdateStatus()}
                          updateBusy={updateBusy}
                        />
                      ) : (
                        <p className="text-sm text-text-muted">Failed to load details</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

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

function DetailPanel({
  order,
  newStatus,
  setNewStatus,
  onUpdate,
  updateBusy,
}: {
  order: GetOrderByIdResponse;
  newStatus: string;
  setNewStatus: (s: OrderStatus | '') => void;
  onUpdate: () => void;
  updateBusy: boolean;
}) {
  const allowed = VALID_TRANSITIONS[order.orderStatus] ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="m-0 text-base font-semibold text-text">Order #{order.orderId}</h3>
        <div className="flex items-center gap-2">
          {allowed.length > 0 ? (
            <>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className={inputCls}
              >
                <option value="">Change status…</option>
                {allowed.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                disabled={newStatus === '' || updateBusy}
                onClick={onUpdate}
                className="cursor-pointer rounded-[var(--radius-md)] bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateBusy ? 'Updating…' : 'Update'}
              </button>
            </>
          ) : (
            <span className="text-sm text-text-muted italic">No transitions available</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-text-muted">Total</p>
          <p className="m-0 mt-1 text-lg font-bold text-text">₹{order.totalPrice}</p>
        </div>
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-text-muted">Ship to</p>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            {[order.addressLine, order.landmark, `PIN ${order.pinCode}`].filter(Boolean).join(', ')}
          </p>
          <p className="m-0 mt-1 text-sm text-text-secondary">{order.contactNumber}</p>
        </div>
      </div>

      {order.orderItems.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-100">
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Product</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((it, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="px-4 py-2 text-sm text-text-secondary">#{it.productId}</td>
                  <td className="px-4 py-2 text-sm text-text-secondary">{it.quantity}</td>
                  <td className="px-4 py-2 text-sm font-medium text-text">₹{it.priceAtCheckout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
