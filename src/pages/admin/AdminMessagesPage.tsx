import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ContactMessage } from '../../../worker/types';
import { toast } from 'sonner';
export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/messages');
        if (!response.ok) throw new Error('Failed to fetch messages');
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        } else {
          throw new Error(result.error || 'An unknown error occurred');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast.error('Error fetching messages', { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);
  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    if (!message.read) {
      try {
        await fetch(`/api/messages/${message.id}/read`, { method: 'PUT' });
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m));
      } catch (err) {
        console.error("Failed to mark message as read", err);
      }
    }
  };
  const handleDeleteClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedMessage) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${selectedMessage.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete message');
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      toast.success('Message deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error('Error deleting message', { description: errorMessage });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
    }
  };
  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive py-8">Error: {error}</TableCell>
        </TableRow>
      );
    }
    if (messages.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">You have no messages yet.</TableCell>
        </TableRow>
      );
    }
    return messages.map((message) => (
      <TableRow key={message.id} className={!message.read ? 'bg-primary/5 font-semibold' : ''}>
        <TableCell>{message.name}</TableCell>
        <TableCell>{message.email}</TableCell>
        <TableCell>{format(new Date(message.timestamp), 'PPpp')}</TableCell>
        <TableCell>
          <Badge variant={message.read ? 'secondary' : 'default'}>{message.read ? 'Read' : 'Unread'}</Badge>
        </TableCell>
        <TableCell className="text-right space-x-1">
          <Button variant="ghost" size="icon" onClick={() => handleViewMessage(message)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(message)}><Trash2 className="h-4 w-4" /></Button>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Messages submitted through the contact form on your website.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableContent()}</TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
            <DialogDescription>{selectedMessage?.email} &bull; {selectedMessage && format(new Date(selectedMessage.timestamp), 'PPpp')}</DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
            {selectedMessage?.message}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the message from your records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}