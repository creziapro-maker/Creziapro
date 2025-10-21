import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import type { Project } from '../../worker/types';
export function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const result = await response.json();
        if (result.success) {
          setProjects(result.data);
        } else {
          throw new Error(result.error || 'An unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-16 grid gap-12 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="overflow-hidden h-full flex flex-col">
              <Skeleton className="w-full h-64" />
              <CardContent className="p-6 flex-grow flex flex-col">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-24 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
                <div className="mt-6 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="mt-16 text-center text-destructive">
          <p>Error: {error}</p>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }
    if (projects.length === 0) {
      return (
        <div className="mt-16 text-center text-muted-foreground">
          <p>No projects are available at the moment. Please check back later.</p>
        </div>
      );
    }
    return (
      <div className="mt-16 grid gap-12 grid-cols-1 md:grid-cols-2">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden h-full flex flex-col group hover:shadow-2xl transition-shadow duration-300">
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
                  <Badge
                    variant={project.status === 'Completed' ? 'default' : 'secondary'}
                    className={project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="mt-4 text-muted-foreground flex-grow">{project.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Our Portfolio</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We take pride in the solutions we've delivered. Here's a selection of our work.
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}