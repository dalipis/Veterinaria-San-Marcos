import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../contexts/useStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login.html" replace />;
  return <>{children}</>;
}
