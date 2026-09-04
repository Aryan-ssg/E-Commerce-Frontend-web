import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../api/cart';
import { placeOrder, verifyPayment } from '../api/orders';
import { createPaymentOrder } from '../api/payment';
import { loadRazorpayScript, openRazorpay } from '../utils/razorpay';
import type { CartResponse } from '../types';

interface FieldErrors {
  addressLine?: string;
  pinCode?: string;
}

const PIN_RE = /^[1-9][0-9]{5}$/;

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addressLine, setAddressLine] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);


  useEffect(() => {
    getCart()
      .then(setCart)
      .catch(() => setError('Failed to load cart'));
  }, []);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!addressLine.trim()) e.addressLine = 'Address is required';
    if (!pinCode.trim()) e.pinCode = 'PIN code is required';
    else if (!PIN_RE.test(pinCode.trim())) e.pinCode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setError('');
    if (!validate()) return;

    setBusy(true);
    try {
      const order = await placeOrder({
        orderItems: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        addressLine: addressLine.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim() || undefined,
      });

      const payment = await createPaymentOrder(order.orderId);

      await loadRazorpayScript();
      const result = await openRazorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: 'Shop',
        theme: { color: '#4338ca' },
      });

      await verifyPayment(order.orderId, {
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });

      setDone(true);
      setTimeout(() => navigate('/orders'), 1500);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Payment could not be completed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
            <path d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text">Payment successful!</h2>
        <p className="mt-2 text-sm text-text-secondary">Redirecting to your orders…</p>
      </div>
    );
  }

  if (!cart) {
    if (error) {
      return (
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="rounded-md border border-error/20 bg-error-light px-4 py-3 text-sm text-error">{error}</div>
        </div>
      );
    }
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm text-text-secondary">Loading checkout…</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-text">Your cart is empty</h2>
        <p className="mt-2 text-sm text-text-secondary">Add items before checking out.</p>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

  return (
    <div className="mx-auto max-w-145 px-4">
      <h1 className="mb-6 text-3xl font-extrabold text-text">Checkout</h1>

      {/* Order summary card */}
      <div className="mb-5 rounded-lg border border-border bg-surface p-5 shadow-(--shadow-card)">
        <h3 className="m-0 mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Your order</h3>
        <div className="flex flex-col gap-2">
          {cart.items.map((i) => (
            <div key={i.cartItemId} className="flex items-center justify-between text-sm">
              <span className="text-text">
                {i.productName} <span className="text-text-muted">× {i.quantity}</span>
              </span>
              <span className="font-medium text-text">₹{i.lineTotal}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-base font-bold text-text">Total</span>
          <span className="text-xl font-extrabold text-brand">₹{cart.totalPrice}</span>
        </div>
      </div>

      {/* Address form */}
      <div className="rounded-lg border border-border bg-surface p-5 shadow-(--shadow-card)">
        <h3 className="m-0 mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">Delivery address</h3>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="checkout-address" className="mb-1.5 block text-sm font-medium text-text">Address</label>
            <input
              id="checkout-address"
              value={addressLine}
              onChange={(e) => {
                setAddressLine(e.target.value);
                if (errors.addressLine) setErrors({ ...errors, addressLine: undefined });
              }}
              placeholder="House/flat, street, area"
              className={inputCls}
            />
            {errors.addressLine && <p className="mt-1 text-xs text-error">{errors.addressLine}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="checkout-pin" className="mb-1.5 block text-sm font-medium text-text">PIN code</label>
              <input
                id="checkout-pin"
                value={pinCode}
                inputMode="numeric"
                maxLength={6}
                onChange={(e) => {
                  setPinCode(e.target.value);
                  if (errors.pinCode) setErrors({ ...errors, pinCode: undefined });
                }}
                placeholder="6-digit PIN"
                className={inputCls}
              />
              {errors.pinCode && <p className="mt-1 text-xs text-error">{errors.pinCode}</p>}
            </div>
            <div>
              <label htmlFor="checkout-landmark" className="mb-1.5 block text-sm font-medium text-text">
                Landmark <span className="text-text-muted">(optional)</span>
              </label>
              <input
                id="checkout-landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Nearby landmark"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handlePay} disabled={busy} className="mt-5 w-full cursor-pointer rounded-md bg-brand px-4 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing…
          </span>
        ) : (
          <span>
            <span className="mr-1"> Pay ₹ </span>
             {cart.totalPrice}
          </span>

        )}
      </button>
      {error && (
        <div className="mt-3 rounded-md border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
    </div>
  );
}
