// ─── Price formatting ─────────────────────────────────────────────────────────
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const discountPercent = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

// ─── Date formatting ──────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

// ─── Query string builder ─────────────────────────────────────────────────────
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === '' || v === null || v === undefined) return;
    if (Array.isArray(v)) { v.forEach((val) => query.append(k, val)); }
    else query.set(k, v);
  });
  return query.toString();
};

// ─── Order status config ──────────────────────────────────────────────────────
export const orderStatusConfig = {
  placed:            { label: 'Order Placed',        color: 'bg-blue-100 text-blue-700' },
  confirmed:         { label: 'Confirmed',            color: 'bg-indigo-100 text-indigo-700' },
  processing:        { label: 'Processing',           color: 'bg-yellow-100 text-yellow-700' },
  shipped:           { label: 'Shipped',              color: 'bg-orange-100 text-orange-700' },
  out_for_delivery:  { label: 'Out for Delivery',     color: 'bg-purple-100 text-purple-700' },
  delivered:         { label: 'Delivered',            color: 'bg-green-100 text-green-700' },
  cancelled:         { label: 'Cancelled',            color: 'bg-red-100 text-red-700' },
  return_requested:  { label: 'Return Requested',     color: 'bg-pink-100 text-pink-700' },
  returned:          { label: 'Returned',             color: 'bg-gray-100 text-gray-700' },
  refunded:          { label: 'Refunded',             color: 'bg-teal-100 text-teal-700' },
};

export const paymentStatusConfig = {
  pending:  { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700' },
  paid:     { label: 'Paid',            color: 'bg-green-100 text-green-700' },
  failed:   { label: 'Payment Failed',  color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded',        color: 'bg-teal-100 text-teal-700' },
};

// ─── Load Razorpay SDK ────────────────────────────────────────────────────────
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script  = document.createElement('script');
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror= () => resolve(false);
    document.body.appendChild(script);
  });

// ─── Truncate text ────────────────────────────────────────────────────────────
export const truncate = (str, n = 80) => str?.length > n ? `${str.slice(0, n)}…` : str;

// ─── Debounce ─────────────────────────────────────────────────────────────────
export const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};
