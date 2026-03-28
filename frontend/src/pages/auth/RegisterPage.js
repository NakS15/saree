import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { register as registerUser } from '../../features/auth/authSlice';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Valid email required'),
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian phone required').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
  role:     z.enum(['customer', 'vendor']),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

export default function RegisterPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const { loading } = useSelector((s) => s.auth);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: params.get('role') === 'vendor' ? 'vendor' : 'customer' },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    const { confirm, ...payload } = data;
    const result = await dispatch(registerUser(payload));
    if (!result.error) navigate(role === 'vendor' ? '/vendor/kyc' : '/');
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
          <h1 className="font-serif text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of saree lovers</p>
        </div>

        {/* Role selector */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[['customer','🛍️ Shopper'],['vendor','🏪 Seller']].map(([r, label]) => (
            <label key={r} className={`flex-1 py-2 rounded-lg text-sm font-semibold text-center cursor-pointer transition-all ${role === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <input type="radio" value={r} {...register('role')} className="hidden" />
              {label}
            </label>
          ))}
        </div>

        {role === 'vendor' && (
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-3.5 mb-5 text-sm text-gold-800">
            🎉 <strong>Sell on SareeBazaar!</strong> After registration, you'll need to complete KYC to start listing products.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input {...register('name')} placeholder="Priya Sharma" className="input-field" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
            <input {...register('email')} type="email" placeholder="priya@example.com" className="input-field" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm">+91</span>
              <input {...register('phone')} placeholder="9876543210" className="input-field flex-1" maxLength={10} />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
            <div className="relative">
              <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-field pr-11" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
            <input {...register('confirm')} type="password" placeholder="Repeat password" className="input-field" />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
          </div>

          <p className="text-xs text-gray-400">
            By registering you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </p>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
