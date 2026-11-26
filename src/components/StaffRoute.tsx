import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../contexts/useStore';
import AccessDeniedPage from '../pages/AccessDeniedPage';

export default function StaffRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useStore();
  if (loading) return <main className="section"><div className="container" role="status">Verificando sesión...</div></main>;
  if (!user) return <Navigate to="/login.html" replace />;
  if (user.role === 'cliente') return <AccessDeniedPage />;
  return <>{children}</>;
}
