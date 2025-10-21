import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2, Loader2, Star } from 'lucide-react';
import type { Review } from '../../../worker/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      if (result.success) {
        setReviews(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast.error('Error fetching reviews', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);
  const handleApprove = async (review: Review) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}/approve`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to approve review');
      toast.success('Review approved successfully!');
      await fetchReviews();
    } catch (error) {
      toast.error('Error approving review', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedReview) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${selectedReview.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete review');
      toast.success('Review deleted successfully!');
      setIsAlertOpen(false);
      setSelectedReview(null);
      await fetchReviews();
    } catch (error) {
      toast.error('Error deleting review', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const openDeleteAlert = (review: Review) => {
    setSelectedReview(review);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Manage Reviews</h1>
        <Card>
          <CardHeader>
            <CardTitle>Review Moderation</CardTitle>
            <CardDescription>Approve or delete user-submitted reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">No reviews found.</TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {review.rating} <Star className="w-4 h-4 ml-1 text-yellow-400 fill-current" />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                        <TableCell>
                          <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(review.createdAt), 'PP')}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {review.status === 'pending' && (
                            <Button variant="outline" size="sm" onClick={() => handleApprove(review)} disabled={isSubmitting}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(review)}>
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
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review from "{selectedReview?.name}".
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