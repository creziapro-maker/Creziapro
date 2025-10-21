import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import type { ProjectFormValues } from '@/lib/validators';
import type { Project } from '../../../worker/types';
import { toast } from 'sonner';
export function AdminPortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast.error('Error fetching projects', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);
  const handleFormSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    const projectData = {
      ...values,
      tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    try {
      const url = selectedProject ? `/api/projects/${selectedProject.id}` : '/api/projects';
      const method = selectedProject ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error(`Failed to ${selectedProject ? 'update' : 'create'} project`);
      toast.success(`Project ${selectedProject ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error) {
      toast.error(`Error ${selectedProject ? 'updating' : 'creating'} project`, { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete project');
      toast.success('Project deleted successfully!');
      setIsAlertOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error) {
      toast.error('Error deleting project', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const openAddDialog = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };
  const openDeleteAlert = (project: Project) => {
    setSelectedProject(project);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Portfolio</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold">No Projects Found</h3>
              <p className="text-muted-foreground mt-2">Click "Add New Project" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'} className="w-fit">{project.status}</Badge>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(project)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(project)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedProject(null); setIsDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {selectedProject ? 'Update the details of your project.' : 'Fill in the details for the new project.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              onSubmit={handleFormSubmit}
              initialData={selectedProject}
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
              This action cannot be undone. This will permanently delete the project "{selectedProject?.title}".
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