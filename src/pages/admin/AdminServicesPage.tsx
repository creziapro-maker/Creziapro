import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, HelpCircle } from 'lucide-react';
import { ServiceForm } from '@/components/admin/ServiceForm';
import type { ServiceFormValues } from '@/lib/validators';
import type { Service } from '../../../worker/types';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
type IconName = keyof typeof LucideIcons;
const Icon = ({ name, ...props }: { name: IconName } & LucideProps) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <HelpCircle {...props} />;
  }
  return <LucideIcon {...props} />;
};
export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const result = await response.json();
      if (result.success) {
        setServices(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast.error('Error fetching services', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);
  const handleFormSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    const serviceData = {
      ...values,
      features: values.features.split('\n').filter(f => f.trim() !== ''),
    };
    try {
      const url = selectedService ? `/api/services/${selectedService.id}` : '/api/services';
      const method = selectedService ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) throw new Error(`Failed to ${selectedService ? 'update' : 'create'} service`);
      toast.success(`Service ${selectedService ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      setSelectedService(null);
      await fetchServices(); // Refetch to get the latest list
    } catch (error) {
      toast.error(`Error ${selectedService ? 'updating' : 'creating'} service`, { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/services/${selectedService.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete service');
      toast.success('Service deleted successfully!');
      setIsAlertOpen(false);
      setSelectedService(null);
      await fetchServices();
    } catch (error) {
      toast.error('Error deleting service', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const openAddDialog = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };
  const openDeleteAlert = (service: Service) => {
    setSelectedService(service);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Services</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold">No Services Found</h3>
              <p className="text-muted-foreground mt-2">Click "Add New Service" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader className="flex-row items-start gap-4 space-y-0">
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon name={service.icon as IconName} className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <PlusCircle className="w-3 h-3 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(service)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedService(null); setIsDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {selectedService ? 'Update the details of your service.' : 'Fill in the details for the new service.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ServiceForm
              onSubmit={handleFormSubmit}
              initialData={selectedService}
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
              This action cannot be undone. This will permanently delete the service "{selectedService?.title}".
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