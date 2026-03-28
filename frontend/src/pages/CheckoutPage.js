import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { selectCartItems, selectCartSubtotal, resetCart } from '../features/cart/cartSlice';
import { paymentService } from '../services';
import { formatPrice, loadRazorpay } from '../utils/helpers';
import api from '../services/api';

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartSubtotal);
  const { couponCode, couponDiscount } = useSelector((s) => s.cart);

  const [step,        setStep]        = useState(0);
  const [addresses,   setAddresses]   = useState(user?.addresses || []);
  const [selAddr,     setSelAddr]     = useState(null);
  const [shipping,    setShipping]    = useState('standard');
  const [payMethod,   setPayMethod]   = useState('razorpay');
  const [processing,  setProcessing]  = useState(false);
  const [addingAddr,  setAddingAddr]  = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/users/addresses').then((r) => {
      setAddresses(r.data.data);
      const def = r.data.data.find((a) => a.isDefault) || r.data.data[0];
      if (def) setSelAddr(def._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items]);

  const shippingCharge = shipping === 'express' ? 199 : subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCharge + tax - couponDiscount;

  const addAddress = async (data) => {
    try {
      const res = await api.post('/users/addresses', data);
      setAddresses(res.data.data);
      setSelAddr(res.data.data[res.data.data.length - 1]._id);
      setAddingAddr(false); reset();
      toast.success('Address saved!');
    } catch { toast.error('Failed to save address'); }
  };

  const handlePayment = async () => {
    if (!selAddr) { toast.error('Please select a delivery address'); return; }
    setProcessing(true);

    try {
      if (payMethod === 'cod') {
        const res = await paymentService.createCOD({ shippingAddressId: selAddr, shippingOption: shipping, couponCode });
        dispatch(resetCart());
        navigate(`/orders/${res.data.data._id}?success=true`);
        return;
      }

      if (payMethod === 'razorpay') {
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Payment gateway failed to load. Try again.'); return; }

        const { data: { data: orderData } } = await paymentService.createRazorpayOrder({
          shippingAddressId: selAddr, shippingOption: shipping, couponCode,
        });

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'SareeBazaar',
          description: `${items.length} saree(s)`,
          order_id: orderData.orderId,
          prefill: { name: user.name, email: user.email, contact: user.phone },
          theme: { color: '#c41e3a' },
          handler: async (response) => {
            try {
              const res = await paymentService.verifyRazorpay({
                ...response,
                orderData: { shippingAddressId: selAddr, shippingOption: shipping, couponCode, ...orderData.summary },
              });
              dispatch(resetCart());
              navigate(`/orders/${res.data.data._id}?success=true`);
            } catch { toast.error('Payment verification failed. Contact support.'); }
          },
          modal: { ondismiss: () => setProcessing(false) },
        };
        new window.Razorpay(options).open();
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container py-8">
      {/* Steps */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 rounded ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="font-serif text-xl font-bold mb-5">Delivery Address</h2>
              <div className="space-y-3 mb-5">
                {addresses.map((addr) => (
                  <label key={addr._id} className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selAddr === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="address" value={addr._id} checked={selAddr === addr._id} onChange={() => setSelAddr(addr._id)} className="mt-1 accent-primary-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{addr.fullName}</span>
                        {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 text-xs">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-500">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              {!addingAddr ? (
                <button onClick={() => setAddingAddr(true)} className="flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors">
                  <PlusIcon className="w-4 h-4" /> Add New Address
                </button>
              ) : (
                <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(addAddress)}
                  className="border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-gray-800">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><input {...register('fullName', { required: true })} placeholder="Full Name *" className="input-field text-sm py-2.5" /></div>
                    <div><input {...register('phone', { required: true })} placeholder="Phone *" className="input-field text-sm py-2.5" /></div>
                  </div>
                  <input {...register('addressLine1', { required: true })} placeholder="Address Line 1 *" className="input-field text-sm py-2.5" />
                  <input {...register('addressLine2')} placeholder="Address Line 2" className="input-field text-sm py-2.5" />
                  <div className="grid grid-cols-3 gap-3">
                    <input {...register('city', { required: true })} placeholder="City *" className="input-field text-sm py-2.5" />
                    <input {...register('state', { required: true })} placeholder="State *" className="input-field text-sm py-2.5" />
                    <input {...register('pincode', { required: true })} placeholder="Pincode *" className="input-field text-sm py-2.5" maxLength={6} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" {...register('isDefault')} className="accent-primary-500" /> Set as default address
                  </label>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary text-sm py-2.5 px-6">Save Address</button>
                    <button type="button" onClick={() => setAddingAddr(false)} className="btn-secondary text-sm py-2.5 px-6">Cancel</button>
                  </div>
                </motion.form>
              )}

              <button onClick={() => selAddr && setStep(1)} disabled={!selAddr}
                className="btn-primary w-full py-3.5 mt-6 disabled:opacity-50">Continue to Delivery →</button>
            </div>
          )}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-serif text-xl font-bold mb-5">Delivery Options</h2>
              <div className="space-y-3 mb-6">
                {[
                  { id: 'standard', label: 'Standard Delivery', desc: '5-7 business days', price: subtotal >= 999 ? 0 : 99 },
                  { id: 'express',  label: 'Express Delivery',  desc: '2-3 business days', price: 199 },
                ].map((opt) => (
                  <label key={opt.id} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${shipping === opt.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" value={opt.id} checked={shipping === opt.id} onChange={() => setShipping(opt.id)} className="accent-primary-500" />
                      <div>
                        <p className="font-semibold text-gray-800">{opt.label}</p>
                        <p className="text-sm text-gray-500">{opt.desc}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${opt.price === 0 ? 'text-green-600' : 'text-gray-800'}`}>{opt.price === 0 ? 'FREE' : formatPrice(opt.price)}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-serif text-xl font-bold mb-5">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { id: 'razorpay', label: 'Pay Online', desc: 'UPI, Cards, Net Banking, Wallets via Razorpay', icon: '💳' },
                  { id: 'cod',      label: 'Cash on Delivery', desc: 'Pay when your order arrives (₹49 COD fee)', icon: '💰' },
                ].map((m) => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${payMethod === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-primary-500" />
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{m.label}</p>
                      <p className="text-sm text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-serif text-xl font-bold mb-5">Review Your Order</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.product?.images?.[0]?.url} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.product?.name || item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={handlePayment} disabled={processing} className="btn-primary flex-1 py-3 text-base">
                  {processing ? 'Processing...' : payMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-3 text-sm">
            <h3 className="font-serif text-lg font-bold text-gray-900">Order Summary</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className={shippingCharge === 0 ? 'text-green-600' : ''}>{shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}</span></div>
              <div className="flex justify-between"><span>Tax (GST 5%)</span><span>{formatPrice(tax)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(couponDiscount)}</span></div>}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
              <span>Total</span><span className="text-primary-600">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>🔒</span> Secure 256-bit SSL encrypted payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
