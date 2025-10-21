import { z } from 'zod';
// Schema for the Service Form
export const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().min(2, 'Icon name is required (e.g., "Code")'),
  features: z.string().min(3, 'At least one feature is required'),
});
export type ServiceFormValues = z.infer<typeof serviceSchema>;
// Schema for the Project Form
export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('Must be a valid URL'),
  status: z.enum(['Ongoing', 'Completed']),
  tags: z.string().min(2, 'At least one tag is required'),
});
export type ProjectFormValues = z.infer<typeof projectSchema>;
// Schema for the Blog Post Form
export const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  author: z.string().min(2, 'Author name is required'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  published: z.boolean(),
});
export type BlogPostFormValues = z.infer<typeof blogPostSchema>;
// Schema for the Site Settings Form
export const siteSettingsSchema = z.object({
  heroTitle: z.string().min(5, 'Hero title must be at least 5 characters'),
  heroSubtitle: z.string().min(10, 'Hero subtitle must be at least 10 characters'),
  heroCtaText: z.string().min(3, 'CTA text must be at least 3 characters'),
  contactEmail: z.string().email('Must be a valid email'),
  contactPhone: z.string().min(10, 'Must be a valid phone number'),
  twitterUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  facebookUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  chatbotPrompt: z.string().min(20, 'Chatbot prompt must be at least 20 characters'),
});
export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
// Schema for the Banner Form
export const bannerSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  imageUrl: z.string().url('Must be a valid image URL'),
  link: z.string().url('Must be a valid link URL'),
  published: z.boolean(),
});
export type BannerFormValues = z.infer<typeof bannerSchema>;
// Schema for the Review Form
export const reviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rating: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 5, {
    message: 'Please select a rating from 1 to 5',
  }),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});
export type ReviewFormValues = z.infer<typeof reviewSchema>;