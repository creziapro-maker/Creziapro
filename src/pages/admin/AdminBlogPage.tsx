import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { BlogPostForm } from '@/components/admin/BlogPostForm';
import type { BlogPostFormValues } from '@/lib/validators';
import type { BlogPost } from '../../../worker/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const result = await response.json();
      if (result.success) {
        setPosts(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast.error('Error fetching posts', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, []);
  const handleFormSubmit = async (values: BlogPostFormValues) => {
    setIsSubmitting(true);
    try {
      const url = selectedPost ? `/api/blog/${selectedPost.id}` : '/api/blog';
      const method = selectedPost ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error(`Failed to ${selectedPost ? 'update' : 'create'} post`);
      toast.success(`Post ${selectedPost ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      toast.error(`Error ${selectedPost ? 'updating' : 'creating'} post`, { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedPost) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/blog/${selectedPost.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete post');
      toast.success('Post deleted successfully!');
      setIsAlertOpen(false);
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      toast.error('Error deleting post', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const openAddDialog = () => {
    setSelectedPost(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };
  const openDeleteAlert = (post: BlogPost) => {
    setSelectedPost(post);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Blog</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
            <CardDescription>Create, edit, and manage your blog posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : posts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">No posts found.</TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell>
                          <Badge variant={post.published ? 'default' : 'secondary'}>
                            {post.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(post.createdAt), 'PP')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(post)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedPost(null); setIsDialogOpen(open); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {selectedPost ? 'Update the details of your blog post.' : 'Fill in the details for the new post.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <BlogPostForm
              onSubmit={handleFormSubmit}
              initialData={selectedPost}
              isSubmitting={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post "{selectedPost?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}