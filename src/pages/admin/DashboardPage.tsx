import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Briefcase, FileText, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
interface DashboardStats {
  messages: number;
  services: number;
  projects: number;
  blogPosts: number;
}
export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        toast.error('Error fetching stats', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);
  const kpiCards = [
    { title: 'Contact Messages', value: stats?.messages, icon: MessageSquare, description: 'Total messages received' },
    { title: 'Services Offered', value: stats?.services, icon: Briefcase, description: 'Total active services' },
    { title: 'Portfolio Projects', value: stats?.projects, icon: FileText, description: 'Completed & ongoing' },
    { title: 'Blog Posts', value: stats?.blogPosts, icon: Newspaper, description: 'Total posts created' },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-2xl font-bold">{card.value ?? 'N/A'}</div>
              )}
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your control center for the Creziapro website. You can manage services, portfolio items, and view contact messages from here. More features are coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}