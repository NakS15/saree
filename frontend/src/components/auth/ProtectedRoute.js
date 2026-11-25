import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoadingScreen from '../ui/LoadingScreen';
import { fetchMe } from '../../features/auth/authSlice';

export default function ProtectedRoute({ roles = [] }) {
  const dispatch = useDispatch();
  const { user, initialized } = useSelector((s) => s.auth);
  const hasToken = Boolean(localStorage.getItem('accessToken'));
  const restoring = !user && !initialized && hasToken;

  // On a hard reload the profile is still being fetched; don't bounce a signed-in user to /login.
  useEffect(() => { if (restoring) dispatch(fetchMe()); }, [restoring, dispatch]);
  if (restoring) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
