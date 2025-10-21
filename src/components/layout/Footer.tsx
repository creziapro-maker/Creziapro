import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import type { SiteSettings } from '../../../worker/types';
export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch site settings for footer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);
  const socialLinks = [
    { icon: Twitter, href: settings?.twitterUrl || '#' },
    { icon: Facebook, href: settings?.facebookUrl || '#' },
    { icon: Linkedin, href: settings?.linkedinUrl || '#' },
  ];
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Contact', href: '/contact' },
    { name: 'Admin Login', href: '/admin' },
  ];
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-crezia-blue dark:text-white">
              Creziapro
            </h2>
            <p className="text-muted-foreground">Build Smart. Scale Fast.</p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <ShieldCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-sm text-foreground">MSME Registered</p>
                <p className="text-xs text-muted-foreground">Govt. of India</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <NavLink to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {isLoading ? (
                <>
                  <li><Skeleton className="h-4 w-48" /></li>
                  <li><Skeleton className="h-4 w-32 mt-2" /></li>
                </>
              ) : (
                <>
                  <li>Email: {settings?.contactEmail}</li>
                  <li>Phone: {settings?.contactPhone}</li>
                </>
              )}
              <li>Address: New Delhi, India</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Follow Us</h3>
            <div className="flex mt-4 space-x-4">
              {isLoading ? (
                <div className="flex space-x-4">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              ) : (
                socialLinks.map((social, index) => (
                  <a key={index} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                    <social.icon className="h-6 w-6" />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Creziapro. All rights reserved.</p>
          <p className="mt-1">Built with ❤️ at Cloudflare</p>
        </div>
      </div>
    </footer>
  );
}