import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ethnic-cream flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🔐</span>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-3">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <p className="text-green-700 font-semibold">Reset link sent!</p>
              <p className="text-green-600 text-sm mt-1">Check your email <strong>{email}</strong> for the reset link. It expires in 1 hour.</p>
            </div>
            <Link to="/login" className="btn-primary w-full py-3 inline-block text-center">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remember your password? <Link to="/login" className="text-primary-600 font-semibold">Sign in</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
