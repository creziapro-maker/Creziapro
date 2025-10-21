import { Mail, Phone, MapPin, Loader2, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;
export function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });
  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }
      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    } catch (error) {
      toast.error("Failed to send message.", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-crezia-orange tracking-wide uppercase">Contact Us</h2>
          <p className="mt-1 text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
            Get in touch
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-muted-foreground">
            Have a project in mind? We'd love to hear from you.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-8 bg-muted rounded-xl">
            <Mail className="w-12 h-12 text-crezia-orange" />
            <h3 className="mt-6 text-xl font-medium text-foreground">Email</h3>
            <p className="mt-2 text-base text-muted-foreground">contact@creziapro.com</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-muted rounded-xl">
            <Phone className="w-12 h-12 text-crezia-orange" />
            <h3 className="mt-6 text-xl font-medium text-foreground">Phone</h3>
            <p className="mt-2 text-base text-muted-foreground">+91 12345 67890</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-muted rounded-xl">
            <MapPin className="w-12 h-12 text-crezia-orange" />
            <h3 className="mt-6 text-xl font-medium text-foreground">Address</h3>
            <p className="mt-2 text-base text-muted-foreground">New Delhi, India</p>
          </div>
        </div>
        <div className="mt-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop"
                alt="Contact us background"
              />
              <div className="absolute inset-0 bg-crezia-blue/70"></div>
              <div className="relative h-full flex flex-col justify-end p-8 text-white">
                <h3 className="text-3xl font-bold">Let's build something great together.</h3>
                <p className="mt-2 text-lg opacity-90">Our team is ready to turn your vision into reality.</p>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your project..." rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Button type="submit" className="w-full bg-crezia-orange hover:bg-crezia-orange/90 text-crezia-blue font-bold" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Message
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
        <div className="mt-24">
          <Card className="bg-muted/50 border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Connect on WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground max-w-md mx-auto">
                Our intelligent WhatsApp bot is coming soon! Get instant quotes and service details right from your favorite messaging app.
              </p>
              <Button className="mt-6" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}