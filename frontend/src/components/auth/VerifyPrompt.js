import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { updateUser } from '../../features/auth/authSlice';

export default function VerifyPrompt({ email }) {
  const dispatch = useDispatch();
  const [sent, setSent]         = useState(false);
  const [code, setCode]         = useState('');
  const [busy, setBusy]         = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode]   = useState('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    setBusy(true);
    try {
      const res = await api.post('/auth/resend-verification');
      setSent(true); setCooldown(60); setDevCode(res.data.devCode || '');
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send the email');
    } finally { setBusy(false); }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await api.post('/auth/verify-email-code', { code });
      dispatch(updateUser({ isEmailVerified: true }));
      toast.success('Email verified');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally { setBusy(false); }
  };

  return (
    <div className="border border-gold-300 bg-ethnic-cream p-5 md:p-6 mb-8">
      <p className="eyebrow mb-2">One quick step</p>
      <h2 className="font-serif text-2xl text-ink mb-2">Verify your email to place an order</h2>
      <p className="text-sm text-gray-600 font-light mb-4">
        We&apos;ll send a 6-digit code to <span className="font-medium text-ink">{email}</span>. You can also click the link in that email.
      </p>

      {!sent ? (
        <button onClick={send} disabled={busy} className="btn-primary disabled:opacity-50">Send verification code</button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
            className="input-field sm:w-44 text-center tracking-[0.4em] text-lg"
          />
          <button onClick={verify} disabled={busy || code.length !== 6} className="btn-primary disabled:opacity-50">Verify</button>
          <button onClick={send} disabled={busy || cooldown > 0} className="link-underline disabled:opacity-40 self-start sm:self-auto">
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
      )}
      {devCode && <p className="text-xs text-gray-500 mt-3">Development mode: your code is <strong>{devCode}</strong></p>}
    </div>
  );
}
