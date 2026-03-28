import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status,  setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-ethnic-cream flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4 animate-pulse">✉️</div>
            <p className="text-gray-500">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-500 mb-8">Your email has been verified. You can now sign in to SareeBazaar.</p>
            <Link to="/login" className="btn-primary px-10 py-3.5 inline-block">Sign In</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-500 mb-8">The link is invalid or has expired. Please request a new verification email.</p>
            <Link to="/login" className="btn-primary px-10 py-3.5 inline-block">Go to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
