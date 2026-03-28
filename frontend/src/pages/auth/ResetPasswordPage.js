import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function ResetPasswordPage() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [pwd,        setPwd]    = useState('');
  const [confirm,    setConfirm]= useState('');
  const [showPwd,    setShowPwd]= useState(false);
  const [loading,    setLoading]= useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pwd !== confirm) { toast.error("Passwords don't match"); return; }
    if (pwd.length < 8)  { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: pwd });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ethnic-cream flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🔑</span>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-3">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new secure password</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)}
                placeholder="Min. 8 characters" className="input-field pr-11" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="text-primary-600 font-semibold">Back to Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
