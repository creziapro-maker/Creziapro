import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { BlogPost } from '../../worker/types';
export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/blog?publishedOnly=true');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const result = await response.json();
        if (result.success) {
          setPosts(result.data);
        } else {
          throw new Error(result.error || 'An unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-28" />
              </CardFooter>
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
    if (posts.length === 0) {
      return (
        <div className="mt-16 text-center text-muted-foreground">
          <p>No blog posts have been published yet. Please check back later.</p>
        </div>
      );
    }
    return (
      <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{post.title}</CardTitle>
                <CardDescription>
                  By {post.author} on {format(new Date(post.createdAt), 'PP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">
                  {post.content.substring(0, 150)}...
                </p>
              </CardContent>
              <CardFooter>
                <Link to={`/blog/${post.slug}`} className="font-semibold text-primary hover:underline flex items-center">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };
  return (
    <div className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">From the Blog</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Insights, tutorials, and news from the Creziapro team.
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}