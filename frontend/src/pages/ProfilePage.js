import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateUser } from '../features/auth/authSlice';
import { uploadService } from '../services';
import api from '../services/api';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [tab,     setTab]    = useState('profile');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });

  useEffect(() => { reset({ name: user?.name, phone: user?.phone }); }, [user]);

  const onSave = async (data) => {
    try {
      const res = await api.put('/users/profile', data);
      dispatch(updateUser(res.data.data));
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setUploading(true);
    try {
      const res = await uploadService.uploadAvatar(fd);
      await api.put('/users/profile', { avatar: res.data.data.url });
      dispatch(updateUser({ avatar: res.data.data.url }));
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  return (
    <div className="page-container py-8 max-w-3xl">
      <h1 className="section-title mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1 mb-6">
        {[['profile','Profile'],['security','Security']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab===k?'border-primary-500 text-primary-600':'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                : <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">{user?.name?.[0]}</div>
              }
              <label className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 cursor-pointer hover:bg-gray-50 shadow-sm">
                <span className="text-xs">📷</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-xs text-primary-600 font-medium capitalize mt-0.5">{user?.role}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input {...register('name')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm">+91</span>
                <input {...register('phone')} className="input-field flex-1" maxLength={10} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (read only)</label>
              <input value={user?.email || ''} readOnly className="input-field bg-gray-50 cursor-not-allowed" />
            </div>
            <button type="submit" className="btn-primary px-8">Save Changes</button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Change Password</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd);
            if (data.newPassword !== data.confirmPassword) { toast.error("Passwords don't match"); return; }
            try {
              await api.put('/users/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
              toast.success('Password changed!'); e.target.reset();
            } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" name="currentPassword" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" name="newPassword" className="input-field" minLength={8} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input type="password" name="confirmPassword" className="input-field" required />
            </div>
            <button type="submit" className="btn-primary px-8">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}
