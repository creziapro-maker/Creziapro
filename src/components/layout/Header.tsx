import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  const NavLinkItem = ({ href, name }: { href: string; name: string }) => (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'text-lg md:text-base font-medium transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )
      }
    >
      {name}
    </NavLink>
  );
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-sm border-b' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex-shrink-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-crezia-blue to-crezia-orange text-transparent bg-clip-text dark:from-white dark:to-crezia-orange">
              Creziapro
            </h1>
          </NavLink>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} {...link} />
            ))}
          </nav>
          <div className="hidden md:block">
            <ThemeToggle className="relative top-0 right-0" />
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggle className="relative top-0 right-0 mr-2" />
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} {...link} />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}