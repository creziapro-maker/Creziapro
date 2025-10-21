import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsForm } from '@/components/admin/SettingsForm';
import type { SiteSettingsFormValues } from '@/lib/validators';
import type { SiteSettings } from '../../../worker/types';
import { toast } from 'sonner';
export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        toast.error('Error fetching settings', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);
  const handleFormSubmit = async (values: SiteSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      toast.success('Site settings updated successfully!');
      setSettings(values); // Optimistic update
    } catch (error) {
      toast.error('Error updating settings', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Site Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
          <CardDescription>Manage your website's hero section, contact info, and social links from one place.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : settings ? (
            <SettingsForm
              onSubmit={handleFormSubmit}
              initialData={settings}
              isSubmitting={isSubmitting}
            />
          ) : (
            <p className="text-destructive">Could not load site settings. Please try again later.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}