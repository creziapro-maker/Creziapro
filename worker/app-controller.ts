import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, ContactMessage, Service, Project, BlogPost, SiteSettings, Banner, AdminSession, Review } from './types';
import type { Env } from './core-utils';
// ���� AI Extension Point: Add session management features
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private contactMessages = new Map<string, ContactMessage>();
  private services = new Map<string, Service>();
  private projects = new Map<string, Project>();
  private blogPosts = new Map<string, BlogPost>();
  private banners = new Map<string, Banner>();
  private reviews = new Map<string, Review>();
  private adminSessions = new Map<string, AdminSession>();
  private siteSettings: SiteSettings | null = null;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<SessionInfo | ContactMessage | Service | Project | BlogPost | SiteSettings | Banner | AdminSession | Review>();
      for (const [key, value] of stored) {
        if (key.startsWith('session_')) {
          this.sessions.set(key.replace('session_', ''), value as SessionInfo);
        } else if (key.startsWith('contact_')) {
          this.contactMessages.set(key.replace('contact_', ''), value as ContactMessage);
        } else if (key.startsWith('service_')) {
          this.services.set(key.replace('service_', ''), value as Service);
        } else if (key.startsWith('project_')) {
          this.projects.set(key.replace('project_', ''), value as Project);
        } else if (key.startsWith('blogpost_')) {
          this.blogPosts.set(key.replace('blogpost_', ''), value as BlogPost);
        } else if (key.startsWith('banner_')) {
          this.banners.set(key.replace('banner_', ''), value as Banner);
        } else if (key.startsWith('review_')) {
          this.reviews.set(key.replace('review_', ''), value as Review);
        } else if (key.startsWith('adminsession_')) {
          this.adminSessions.set(key.replace('adminsession_', ''), value as AdminSession);
        } else if (key === 'site_settings') {
          this.siteSettings = value as SiteSettings;
        }
      }
      this.loaded = true;
    }
  }
  // Admin Session Management
  async createAdminSession(userId: string): Promise<string> {
    await this.ensureLoaded();
    const sessionId = crypto.randomUUID();
    const expires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
    const session: AdminSession = { userId, expires };
    this.adminSessions.set(sessionId, session);
    await this.ctx.storage.put(`adminsession_${sessionId}`, session);
    return sessionId;
  }
  async verifyAdminSession(sessionId: string): Promise<AdminSession | null> {
    await this.ensureLoaded();
    const session = this.adminSessions.get(sessionId);
    if (session && session.expires > Date.now()) {
      return session;
    }
    if (session) {
      // Clean up expired session
      this.adminSessions.delete(sessionId);
      await this.ctx.storage.delete(`adminsession_${sessionId}`);
    }
    return null;
  }
  async deleteAdminSession(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    this.adminSessions.delete(sessionId);
    await this.ctx.storage.delete(`adminsession_${sessionId}`);
  }
  // Session Management
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    const sessionInfo: SessionInfo = {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    };
    this.sessions.set(sessionId, sessionInfo);
    await this.ctx.storage.put(`session_${sessionId}`, sessionInfo);
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      await this.ctx.storage.delete(`session_${sessionId}`);
    }
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.ctx.storage.put(`session_${sessionId}`, session);
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.ctx.storage.put(`session_${sessionId}`, session);
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    const keysToDelete = Array.from(this.sessions.keys()).map(id => `session_${id}`);
    this.sessions.clear();
    await this.ctx.storage.delete(keysToDelete);
    return count;
  }
  // Contact Message Management
  async addContactMessage(message: Omit<ContactMessage, 'id' | 'timestamp' | 'read'>): Promise<ContactMessage> {
    await this.ensureLoaded();
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const fullMessage: ContactMessage = { ...message, id, timestamp, read: false };
    this.contactMessages.set(id, fullMessage);
    await this.ctx.storage.put(`contact_${id}`, fullMessage);
    return fullMessage;
  }
  async listContactMessages(): Promise<ContactMessage[]> {
    await this.ensureLoaded();
    return Array.from(this.contactMessages.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
  async markMessageAsRead(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const message = this.contactMessages.get(id);
    if (message) {
      message.read = true;
      this.contactMessages.set(id, message);
      await this.ctx.storage.put(`contact_${id}`, message);
      return true;
    }
    return false;
  }
  async deleteContactMessage(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.contactMessages.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`contact_${id}`);
    }
    return deleted;
  }
  // Service Management
  async addService(serviceData: Omit<Service, 'id'>): Promise<Service> {
    await this.ensureLoaded();
    const id = crypto.randomUUID();
    const newService: Service = { ...serviceData, id };
    this.services.set(id, newService);
    await this.ctx.storage.put(`service_${id}`, newService);
    return newService;
  }
  async updateService(id: string, serviceData: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
    await this.ensureLoaded();
    const existingService = this.services.get(id);
    if (existingService) {
      const updatedService = { ...existingService, ...serviceData };
      this.services.set(id, updatedService);
      await this.ctx.storage.put(`service_${id}`, updatedService);
      return updatedService;
    }
    return null;
  }
  async deleteService(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.services.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`service_${id}`);
    }
    return deleted;
  }
  async listServices(): Promise<Service[]> {
    await this.ensureLoaded();
    return Array.from(this.services.values());
  }
  // Project Management
  async addProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    await this.ensureLoaded();
    const id = crypto.randomUUID();
    const newProject: Project = { ...projectData, id };
    this.projects.set(id, newProject);
    await this.ctx.storage.put(`project_${id}`, newProject);
    return newProject;
  }
  async updateProject(id: string, projectData: Partial<Omit<Project, 'id'>>): Promise<Project | null> {
    await this.ensureLoaded();
    const existingProject = this.projects.get(id);
    if (existingProject) {
      const updatedProject = { ...existingProject, ...projectData };
      this.projects.set(id, updatedProject);
      await this.ctx.storage.put(`project_${id}`, updatedProject);
      return updatedProject;
    }
    return null;
  }
  async deleteProject(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.projects.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`project_${id}`);
    }
    return deleted;
  }
  async listProjects(): Promise<Project[]> {
    await this.ensureLoaded();
    return Array.from(this.projects.values());
  }
  // Blog Post Management
  async addBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt'>): Promise<BlogPost> {
    await this.ensureLoaded();
    const id = crypto.randomUUID();
    const newPost: BlogPost = { ...postData, id, createdAt: Date.now() };
    this.blogPosts.set(id, newPost);
    await this.ctx.storage.put(`blogpost_${id}`, newPost);
    return newPost;
  }
  async updateBlogPost(id: string, postData: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): Promise<BlogPost | null> {
    await this.ensureLoaded();
    const existingPost = this.blogPosts.get(id);
    if (existingPost) {
      const updatedPost = { ...existingPost, ...postData };
      this.blogPosts.set(id, updatedPost);
      await this.ctx.storage.put(`blogpost_${id}`, updatedPost);
      return updatedPost;
    }
    return null;
  }
  async deleteBlogPost(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.blogPosts.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`blogpost_${id}`);
    }
    return deleted;
  }
  async listBlogPosts(publishedOnly = false): Promise<BlogPost[]> {
    await this.ensureLoaded();
    const allPosts = Array.from(this.blogPosts.values()).sort((a, b) => b.createdAt - a.createdAt);
    if (publishedOnly) {
      return allPosts.filter(post => post.published);
    }
    return allPosts;
  }
  // Banner Management
  async addBanner(bannerData: Omit<Banner, 'id'>): Promise<Banner> {
    await this.ensureLoaded();
    const id = crypto.randomUUID();
    const newBanner: Banner = { ...bannerData, id };
    this.banners.set(id, newBanner);
    await this.ctx.storage.put(`banner_${id}`, newBanner);
    return newBanner;
  }
  async updateBanner(id: string, bannerData: Partial<Omit<Banner, 'id'>>): Promise<Banner | null> {
    await this.ensureLoaded();
    const existingBanner = this.banners.get(id);
    if (existingBanner) {
      const updatedBanner = { ...existingBanner, ...bannerData };
      this.banners.set(id, updatedBanner);
      await this.ctx.storage.put(`banner_${id}`, updatedBanner);
      return updatedBanner;
    }
    return null;
  }
  async deleteBanner(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.banners.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`banner_${id}`);
    }
    return deleted;
  }
  async listBanners(publishedOnly = false): Promise<Banner[]> {
    await this.ensureLoaded();
    const allBanners = Array.from(this.banners.values());
    if (publishedOnly) {
      return allBanners.filter(banner => banner.published);
    }
    return allBanners;
  }
  // Review Management
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
    await this.ensureLoaded();
    const id = crypto.randomUUID();
    const newReview: Review = { ...reviewData, id, createdAt: Date.now(), status: 'pending' };
    this.reviews.set(id, newReview);
    await this.ctx.storage.put(`review_${id}`, newReview);
    return newReview;
  }
  async listReviews(status?: 'pending' | 'approved'): Promise<Review[]> {
    await this.ensureLoaded();
    const allReviews = Array.from(this.reviews.values()).sort((a, b) => b.createdAt - a.createdAt);
    if (status) {
      return allReviews.filter(review => review.status === status);
    }
    return allReviews;
  }
  async updateReviewStatus(id: string, status: 'approved'): Promise<Review | null> {
    await this.ensureLoaded();
    const review = this.reviews.get(id);
    if (review) {
      review.status = status;
      this.reviews.set(id, review);
      await this.ctx.storage.put(`review_${id}`, review);
      return review;
    }
    return null;
  }
  async deleteReview(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.reviews.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`review_${id}`);
    }
    return deleted;
  }
  // Site Settings Management
  async getSiteSettings(): Promise<SiteSettings> {
    await this.ensureLoaded();
    if (this.siteSettings) {
      return this.siteSettings;
    }
    // Return default settings if none are stored
    return {
      heroTitle: 'Build Smart. Scale Fast.',
      heroSubtitle: 'Creziapro delivers end-to-end digital solutions, from stunning websites to intelligent AI chatbots, empowering your business to thrive in the digital age.',
      heroCtaText: 'Get a Quote',
      contactEmail: 'contact@creziapro.com',
      contactPhone: '+91 12345 67890',
      twitterUrl: '#',
      facebookUrl: '#',
      linkedinUrl: '#',
      chatbotPrompt: 'You are a helpful assistant for Creziapro. Help users find the right service and provide price estimates based on the available services and their pricing bands.',
    };
  }
  async updateSiteSettings(settings: SiteSettings): Promise<void> {
    await this.ensureLoaded();
    this.siteSettings = settings;
    await this.ctx.storage.put('site_settings', settings);
  }
  // Chatbot Config
  async getChatbotConfig(): Promise<{ prompt: string; services: Service[] }> {
    await this.ensureLoaded();
    const settings = await this.getSiteSettings();
    const services = await this.listServices();
    return {
      prompt: settings.chatbotPrompt,
      services: services,
    };
  }
  // Dashboard Stats
  async getStats(): Promise<{ messages: number; services: number; projects: number; blogPosts: number; }> {
    await this.ensureLoaded();
    return {
      messages: this.contactMessages.size,
      services: this.services.size,
      projects: this.projects.size,
      blogPosts: this.blogPosts.size,
    };
  }
}