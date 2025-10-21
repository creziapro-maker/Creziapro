import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
export function AdminLayout() {
  const { isAuthenticated, isVerifying, verifyAuth } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);
  useEffect(() => {
    if (!isVerifying && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isVerifying, navigate]);
  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return null; // Redirecting
  }
  return (
    <div className="h-screen flex bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}