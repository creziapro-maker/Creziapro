import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { Service } from "../../worker/types";
import type { LucideProps } from 'lucide-react';
type IconName = keyof typeof LucideIcons;
const Icon = ({ name, ...props }: { name: IconName } & LucideProps) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle {...props} />;
  }
  return <LucideIcon {...props} />;
};
export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Failed to fetch services');
        const result = await response.json();
        if (result.success) {
          setServices(result.data);
        } else {
          throw new Error(result.error || 'An unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) =>
          <Card key={index} className="h-full">
              <CardHeader className="flex-row items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-full mb-4" />
                <Skeleton className="h-5 w-3/4" />
                <div className="space-y-2 mt-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>);
    }
    if (error) {
      return (
        <div className="mt-16 text-center text-destructive">
          <p>Error: {error}</p>
          <p>Please try refreshing the page.</p>
        </div>);
    }
    if (services.length === 0) {
      return (
        <div className="mt-16 text-center text-muted-foreground">
          <p>No services are available at the moment. Please check back later.</p>
        </div>);
    }
    return (
      <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) =>
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Card className="h-full flex flex-col hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex-row items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon name={service.icon as IconName} className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle>{service.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <CardDescription className="mb-6">{service.description}</CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground mt-auto">
                  {service.features.map((feature) =>
                <li key={feature} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {feature}
                    </li>
                )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>);
  };
  return (
    <div className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Our Services</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We offer a comprehensive suite of digital services to bring your ideas to life.
          </p>
        </div>
        {renderContent()}
      </div>
    </div>);
}