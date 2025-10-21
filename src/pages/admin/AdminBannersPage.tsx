import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { BannerForm } from '@/components/admin/BannerForm';
import type { BannerFormValues } from '@/lib/validators';
import type { Banner } from '../../../worker/types';
import { toast } from 'sonner';
export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/banners');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const result = await response.json();
      if (result.success) {
        setBanners(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast.error('Error fetching banners', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBanners();
  }, []);
  const handleFormSubmit = async (values: BannerFormValues) => {
    setIsSubmitting(true);
    try {
      const url = selectedBanner ? `/api/banners/${selectedBanner.id}` : '/api/banners';
      const method = selectedBanner ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error(`Failed to ${selectedBanner ? 'update' : 'create'} banner`);
      toast.success(`Banner ${selectedBanner ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      setSelectedBanner(null);
      await fetchBanners();
    } catch (error) {
      toast.error(`Error ${selectedBanner ? 'updating' : 'creating'} banner`, { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedBanner) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/banners/${selectedBanner.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete banner');
      toast.success('Banner deleted successfully!');
      setIsAlertOpen(false);
      setSelectedBanner(null);
      await fetchBanners();
    } catch (error) {
      toast.error('Error deleting banner', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const openAddDialog = () => {
    setSelectedBanner(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDialogOpen(true);
  };
  const openDeleteAlert = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Banners</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Banner
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Homepage Banners</CardTitle>
            <CardDescription>Create, edit, and manage your homepage banners.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-20 rounded" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">No banners found.</TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <img src={banner.imageUrl} alt={banner.title} className="h-10 w-20 object-cover rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{banner.title}</TableCell>
                        <TableCell>
                          <Badge variant={banner.published ? 'default' : 'secondary'}>
                            {banner.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(banner)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(banner)}>
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedBanner(null); setIsDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
            <DialogDescription>
              {selectedBanner ? 'Update the details of your banner.' : 'Fill in the details for the new banner.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <BannerForm
              onSubmit={handleFormSubmit}
              initialData={selectedBanner}
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
              This action cannot be undone. This will permanently delete the banner "{selectedBanner?.title}".
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