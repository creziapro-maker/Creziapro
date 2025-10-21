import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Briefcase, FileText, MessageSquare, LogOut, ShieldCheck, Newspaper, Settings, ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { cn } from '@/lib/utils';
const navItems = [
  { name: 'Dashboard', href: '/admin', icon: Home, exact: true },
  { name: 'Services', href: '/admin/services', icon: Briefcase },
  { name: 'Portfolio', href: '/admin/portfolio', icon: FileText },
  { name: 'Blog', href: '/admin/blog', icon: Newspaper },
  { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];
export function AdminSidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r flex flex-col">
      <div className="h-20 border-b flex items-center px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-crezia-blue dark:text-white">
            Creziapro Admin
          </h1>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}