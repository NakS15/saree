import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { login, sendPhoneOTP, verifyOTP } from '../../features/auth/authSlice';
import api from '../../services/api';

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const { loading } = useSelector((s) => s.auth);

  const [showPwd, setShowPwd]   = useState(false);
  const [mode,    setMode]      = useState('email'); // email | otp
  const [phone,   setPhone]     = useState('');
  const [otp,     setOtp]       = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [otpLoad, setOtpLoad]   = useState(false);

  const redirect = params.get('redirect') || '/';

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onEmailLogin = async (data) => {
    const result = await dispatch(login(data));
    if (!result.error) navigate(redirect);
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setOtpLoad(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
    } catch { } finally { setOtpLoad(false); }
  };

  const handleVerifyOTP = async () => {
    const result = await dispatch(verifyOTP({ phone, otp }));
    if (!result.error) navigate(redirect);
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || '/api/v1'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-ethnic-cream flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🪡</span>
            <span className="font-serif text-2xl font-bold text-primary-600">Saree</span>
            <span className="font-serif text-2xl font-bold text-gold-600">Bazaar</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[['email','Email'],['otp','Phone OTP']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'email' ? (
          <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" autoFocus />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Enter password" className="input-field pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm">+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/,'').slice(0,10))}
                  placeholder="9876543210" className="input-field flex-1" maxLength={10} />
              </div>
            </div>
            {!otpSent ? (
              <button onClick={handleSendOTP} disabled={phone.length !== 10 || otpLoad}
                className="btn-primary w-full py-3.5">
                {otpLoad ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                  <input value={otp} onChange={(e) => setOtp(e.target.value.slice(0,6))}
                    placeholder="6-digit OTP" className="input-field tracking-widest text-center text-xl" maxLength={6} />
                </div>
                <button onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading} className="btn-primary w-full py-3.5">
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button onClick={() => { setOtpSent(false); setOtp(''); }} className="text-sm text-gray-500 hover:text-primary-600 w-full text-center">
                  Resend OTP
                </button>
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="ethnic-divider my-6"><span className="text-gray-400 text-sm px-4">or</span></div>

        {/* Google */}
        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Register free</Link>
        </p>
      </motion.div>
    </div>
  );
}
