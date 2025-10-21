import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuthStore } from '@/lib/authStore';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isVerifying, verifyAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  useEffect(() => {
    // Check auth status on mount
    verifyAuth();
  }, [verifyAuth]);
  useEffect(() => {
    if (!isVerifying && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isVerifying, navigate]);
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const success = await login(data.email, data.password);
    setIsLoading(false);
    if (success) {
      toast.success('Login successful!');
      navigate('/admin', { replace: true });
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password.',
      });
    }
  };
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-crezia-blue dark:text-white">
                Creziapro
              </h1>
            </div>
            <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@creziapro.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Use <span className="font-mono">admin@creziapro.com</span> and <span className="font-mono">password</span></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}