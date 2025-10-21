import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import type { BlogPost } from '../../worker/types';
export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/blog/${slug}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Blog post not found.');
          throw new Error('Failed to fetch blog post');
        }
        const result = await response.json();
        if (result.success) {
          setPost(result.data);
        } else {
          throw new Error(result.error || 'An unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Skeleton className="h-10 w-24 mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full mt-4" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Link to="/blog" className="text-primary hover:underline flex items-center justify-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </div>
    );
  }
  if (!post) {
    return null; // Should be handled by error state
  }
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to all posts
        </Link>
        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">{post.title}</h1>
          <div className="flex items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={new Date(post.createdAt).toISOString()}>
                {format(new Date(post.createdAt), 'PP')}
              </time>
            </div>
          </div>
          {/* A simple way to render markdown-like content. For real markdown, a library like 'react-markdown' would be used. */}
          <div className="whitespace-pre-wrap text-lg leading-relaxed">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
}