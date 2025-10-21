import { useState, useEffect } from 'react';
import { ArrowRight, Code, Palette, BarChart, Star, ShieldCheck, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReviewForm } from '@/components/ReviewForm';
import type { ReviewFormValues } from '@/lib/validators';
import { toast } from 'sonner';
import type { Project, SiteSettings, Banner, Review } from '../../worker/types';
const HeroSection = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-crezia-blue/10 via-transparent to-crezia-orange/10 dark:from-crezia-blue/20 dark:to-crezia-orange/20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 text-sm font-semibold text-crezia-blue dark:text-white bg-crezia-orange/20 dark:bg-crezia-orange/30 rounded-full">
            <ShieldCheck className="w-5 h-5 text-crezia-orange" />
            Trusted MSME Registered Company
          </div>
          {isLoading ? (
            <>
              <Skeleton className="h-12 md:h-16 w-3/4 mx-auto" />
              <Skeleton className="h-7 w-1/2 mx-auto mt-6" />
            </>
          ) : (
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              <span dangerouslySetInnerHTML={{ __html: settings?.heroTitle.replace('Scale Fast.', '<span class="text-crezia-orange">Scale Fast.</span>') || '' }} />
            </h1>
          )}
          {isLoading ? (
            <Skeleton className="h-6 w-4/5 max-w-2xl mx-auto mt-6" />
          ) : (
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              {settings?.heroSubtitle}
            </p>
          )}
          <div className="mt-10 flex justify-center gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-36" />
                <Skeleton className="h-14 w-44" />
              </>
            ) : (
              <>
                <Button size="lg" className="bg-crezia-orange hover:bg-crezia-orange/90 text-crezia-blue font-bold text-lg px-8 py-6 transition-transform duration-200 hover:scale-105">
                  {settings?.heroCtaText}
                </Button>
                <NavLink to="/services">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 transition-transform duration-200 hover:scale-105">
                    View Services <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </NavLink>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
const DynamicBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners?publishedOnly=true');
        if (!response.ok) throw new Error('Failed to fetch banners');
        const result = await response.json();
        if (result.success) {
          setBanners(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);
  if (isLoading) {
    return (
      <section className="py-12 bg-muted/50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
      </section>
    );
  }
  if (banners.length === 0) {
    return null; // Don't render the section if there are no banners
  }
  return (
    <section className="py-12 bg-muted/50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <a href={banner.link} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden">
                    <CardContent className="flex aspect-[16/6] items-center justify-center p-0 relative">
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <h3 className="text-white text-2xl md:text-4xl font-bold text-center p-4">{banner.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};
const FeaturedServices = () => {
  const services = [
    { icon: Code, title: 'Web Development', description: 'High-performance, responsive websites tailored to your brand.' },
    { icon: Palette, title: 'UI/UX Design', description: 'Intuitive and beautiful user interfaces that users love.' },
    { icon: BarChart, title: 'Digital Marketing', description: 'Data-driven strategies to grow your online presence.' },
  ];
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our Core Services</h2>
          <p className="mt-4 text-lg text-muted-foreground">Solutions designed to elevate your business.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-crezia-orange/10">
                    <service.icon className="h-8 w-8 text-crezia-orange" />
                  </div>
                  <CardTitle className="mt-4">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
const PortfolioPreview = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const result = await response.json();
        if (result.success) {
          // Get the 2 most recent projects
          setProjects(result.data.slice(0, 2));
        }
      } catch (error) {
        console.error("Failed to fetch projects for preview:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);
  return (
    <section className="py-24 bg-muted/50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our Work</h2>
          <p className="mt-4 text-lg text-muted-foreground">A glimpse into our successful projects.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-80 rounded-xl" />
            ))
          ) : (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl overflow-hidden"
              >
                <img src={project.image} alt={project.title} className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                  <span className={`mt-1 inline-block px-2 py-0.5 text-sm rounded-md ${project.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {project.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="mt-12 text-center">
          <NavLink to="/portfolio">
            <Button variant="outline" size="lg">
              View Full Portfolio <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </NavLink>
        </div>
      </div>
    </section>
  );
};
const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reviews/approved');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Could not load reviews.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);
  const handleReviewSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, rating: parseInt(values.rating, 10) }),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      toast.success("Review submitted for approval!", {
        description: "Thank you for your feedback.",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to submit review", { description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What Our Clients Say</h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          ) : reviews.length > 0 ? (
            reviews.slice(0, 2).map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  {[...Array(5 - review.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-gray-300" />)}
                </div>
                <blockquote className="text-lg text-foreground">"{review.comment}"</blockquote>
                <p className="mt-4 font-semibold text-right">- {review.name}</p>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground md:col-span-2">Be the first to leave a review!</p>
          )}
        </div>
        <div className="mt-12 text-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <MessageSquarePlus className="mr-2 h-5 w-5" />
                Leave a Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
                <DialogDescription>We'd love to hear your feedback about our services.</DialogDescription>
              </DialogHeader>
              <ReviewForm onSubmit={handleReviewSubmit} isSubmitting={isSubmitting} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
export function HomePage() {
  return (
    <>
      <HeroSection />
      <DynamicBanners />
      <FeaturedServices />
      <PortfolioPreview />
      <Reviews />
    </>
  );
}