import { Hono } from "hono";
import { getAgentByName, type AgentNamespace } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import type { ContactMessage, Service, Project, BlogPost, SiteSettings, Banner, Review } from './types';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { DurableObjectStub, DurableObjectNamespace } from '@cloudflare/workers-types';
import type { AppController } from './app-controller';
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT as unknown as AgentNamespace<ChatAgent>, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Secure Auth Middleware for Admin Routes
    const authMiddleware = async (c: any, next: any) => {
        const sessionId = getCookie(c, 'creziapro_admin_session');
        if (!sessionId) {
            return c.json({ success: false, error: 'Unauthorized: No session' }, { status: 401 });
        }
        const controller = getAppController(c.env);
        const session = await controller.verifyAdminSession(sessionId);
        if (!session) {
            deleteCookie(c, 'creziapro_admin_session');
            return c.json({ success: false, error: 'Unauthorized: Invalid session' }, { status: 401 });
        }
        await next();
    };
    // Admin Auth Routes
    app.post('/api/admin/login', async (c) => {
        const { email, password } = await c.req.json();
        // In a real app, you'd look up the user and verify the password hash
        if (email === 'admin@creziapro.com' && password === 'password') {
            const controller = getAppController(c.env);
            const sessionId = await controller.createAdminSession(email);
            setCookie(c, 'creziapro_admin_session', sessionId, {
                httpOnly: true,
                secure: new URL(c.req.url).protocol === 'https:', // Set to true in production
                sameSite: 'Lax',
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day
            });
            return c.json({ success: true });
        }
        return c.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    });
    app.post('/api/admin/logout', async (c) => {
        const sessionId = getCookie(c, 'creziapro_admin_session');
        if (sessionId) {
            const controller = getAppController(c.env);
            await controller.deleteAdminSession(sessionId);
        }
        deleteCookie(c, 'creziapro_admin_session', { path: '/' });
        return c.json({ success: true });
    });
    app.get('/api/admin/verify', authMiddleware, (c) => {
        return c.json({ success: true });
    });
    // Group all admin API routes and apply middleware
    const adminApi = new Hono<{ Bindings: Env }>();
    adminApi.use('*', authMiddleware);
    // Review Management Routes
    adminApi.get('/reviews', async (c) => {
        try {
            const controller = getAppController(c.env);
            const reviews = await controller.listReviews();
            return c.json({ success: true, data: reviews });
        } catch (error) {
            console.error('Failed to list all reviews:', error);
            return c.json({ success: false, error: 'Failed to retrieve reviews' }, { status: 500 });
        }
    });
    adminApi.put('/reviews/:id/approve', async (c) => {
        try {
            const { id } = c.req.param();
            const controller = getAppController(c.env);
            const updatedReview = await controller.updateReviewStatus(id, 'approved');
            if (!updatedReview) return c.json({ success: false, error: 'Review not found' }, { status: 404 });
            return c.json({ success: true, data: updatedReview });
        } catch (error) {
            console.error('Failed to approve review:', error);
            return c.json({ success: false, error: 'Failed to approve review' }, { status: 500 });
        }
    });
    adminApi.delete('/reviews/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const controller = getAppController(c.env);
            const success = await controller.deleteReview(id);
            if (!success) return c.json({ success: false, error: 'Review not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to delete review:', error);
            return c.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
        }
    });
    // Banner Management Routes
    adminApi.post('/banners', async (c) => {
        try {
            const body = await c.req.json<Omit<Banner, 'id'>>();
            if (!body.title || !body.imageUrl || !body.link) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const newBanner = await controller.addBanner(body);
            return c.json({ success: true, data: newBanner }, { status: 201 });
        } catch (error) {
            console.error('Failed to create banner:', error);
            return c.json({ success: false, error: 'Failed to create banner' }, { status: 500 });
        }
    });
    adminApi.put('/banners/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const body = await c.req.json<Partial<Omit<Banner, 'id'>>>();
            const controller = getAppController(c.env);
            const updatedBanner = await controller.updateBanner(id, body);
            if (!updatedBanner) return c.json({ success: false, error: 'Banner not found' }, { status: 404 });
            return c.json({ success: true, data: updatedBanner });
        } catch (error) {
            console.error('Failed to update banner:', error);
            return c.json({ success: false, error: 'Failed to update banner' }, { status: 500 });
        }
    });
    adminApi.delete('/banners/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const controller = getAppController(c.env);
            const success = await controller.deleteBanner(id);
            if (!success) return c.json({ success: false, error: 'Banner not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to delete banner:', error);
            return c.json({ success: false, error: 'Failed to delete banner' }, { status: 500 });
        }
    });
    // Site Settings Routes
    adminApi.put('/settings', async (c) => {
        try {
            const body = await c.req.json<SiteSettings>();
            const controller = getAppController(c.env);
            await controller.updateSiteSettings(body);
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to update site settings:', error);
            return c.json({ success: false, error: 'Failed to update site settings' }, { status: 500 });
        }
    });
    // Dashboard Stats Route
    adminApi.get('/dashboard/stats', async (c) => {
        try {
            const controller = getAppController(c.env);
            const stats = await controller.getStats();
            return c.json({ success: true, data: stats });
        } catch (error) {
            console.error('Failed to get dashboard stats:', error);
            return c.json({ success: false, error: 'Failed to retrieve dashboard stats' }, { status: 500 });
        }
    });
    // Service Management Routes
    adminApi.post('/services', async (c) => {
        try {
            const body = await c.req.json<Omit<Service, 'id'>>();
            if (!body.title || !body.description || !body.icon || !body.features) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const newService = await controller.addService(body);
            return c.json({ success: true, data: newService }, { status: 201 });
        } catch (error) {
            console.error('Failed to create service:', error);
            return c.json({ success: false, error: 'Failed to create service' }, { status: 500 });
        }
    });
    adminApi.put('/services/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const body = await c.req.json<Partial<Omit<Service, 'id'>>>();
            const controller = getAppController(c.env);
            const updatedService = await controller.updateService(id, body);
            if (!updatedService) return c.json({ success: false, error: 'Service not found' }, { status: 404 });
            return c.json({ success: true, data: updatedService });
        } catch (error) {
            console.error('Failed to update service:', error);
            return c.json({ success: false, error: 'Failed to update service' }, { status: 500 });
        }
    });
    adminApi.delete('/services/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const controller = getAppController(c.env);
            const success = await controller.deleteService(id);
            if (!success) return c.json({ success: false, error: 'Service not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to delete service:', error);
            return c.json({ success: false, error: 'Failed to delete service' }, { status: 500 });
        }
    });
    // Project Management Routes
    adminApi.post('/projects', async (c) => {
        try {
            const body = await c.req.json<Omit<Project, 'id'>>();
            if (!body.title || !body.description || !body.image || !body.status || !body.tags) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const newProject = await controller.addProject(body);
            return c.json({ success: true, data: newProject }, { status: 201 });
        } catch (error) {
            console.error('Failed to create project:', error);
            return c.json({ success: false, error: 'Failed to create project' }, { status: 500 });
        }
    });
    adminApi.put('/projects/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const body = await c.req.json<Partial<Omit<Project, 'id'>>>();
            const controller = getAppController(c.env);
            const updatedProject = await controller.updateProject(id, body);
            if (!updatedProject) return c.json({ success: false, error: 'Project not found' }, { status: 404 });
            return c.json({ success: true, data: updatedProject });
        } catch (error) {
            console.error('Failed to update project:', error);
            return c.json({ success: false, error: 'Failed to update project' }, { status: 500 });
        }
    });
    adminApi.delete('/projects/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const controller = getAppController(c.env);
            const success = await controller.deleteProject(id);
            if (!success) return c.json({ success: false, error: 'Project not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to delete project:', error);
            return c.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
        }
    });
    // Blog Post Management Routes
    adminApi.post('/blog', async (c) => {
        try {
            const body = await c.req.json<Omit<BlogPost, 'id' | 'createdAt'>>();
            if (!body.title || !body.slug || !body.content || !body.author) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const newPost = await controller.addBlogPost(body);
            return c.json({ success: true, data: newPost }, { status: 201 });
        } catch (error) {
            console.error('Failed to create blog post:', error);
            return c.json({ success: false, error: 'Failed to create blog post' }, { status: 500 });
        }
    });
    adminApi.put('/blog/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const body = await c.req.json<Partial<Omit<BlogPost, 'id' | 'createdAt'>>>();
            const controller = getAppController(c.env);
            const updatedPost = await controller.updateBlogPost(id, body);
            if (!updatedPost) return c.json({ success: false, error: 'Blog post not found' }, { status: 404 });
            return c.json({ success: true, data: updatedPost });
        } catch (error) {
            console.error('Failed to update blog post:', error);
            return c.json({ success: false, error: 'Failed to update blog post' }, { status: 500 });
        }
    });
    adminApi.delete('/blog/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const controller = getAppController(c.env);
            const success = await controller.deleteBlogPost(id);
            if (!success) return c.json({ success: false, error: 'Blog post not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to delete blog post:', error);
            return c.json({ success: false, error: 'Failed to delete blog post' }, { status: 500 });
        }
    });
    // Contact Message Routes
    adminApi.get('/messages', async (c) => {
        try {
            const controller = getAppController(c.env);
            const messages = await controller.listContactMessages();
            return c.json({ success: true, data: messages });
        } catch (error) {
            console.error('Failed to list messages:', error);
            return c.json({ success: false, error: 'Failed to retrieve messages' }, { status: 500 });
        }
    });
    adminApi.put('/messages/:id/read', async (c) => {
        try {
            const { id } = c.req.param();
            if (!id) return c.json({ success: false, error: 'Message ID is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const success = await controller.markMessageAsRead(id);
            if (!success) return c.json({ success: false, error: 'Message not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to mark message as read:', error);
            return c.json({ success: false, error: 'Failed to update message' }, { status: 500 });
        }
    });
    adminApi.delete('/messages/:id', async (c) => {
        try {
            const { id } = c.req.param();
            if (!id) return c.json({ success: false, error: 'Message ID is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const success = await controller.deleteContactMessage(id);
            if (!success) return c.json({ success: false, error: 'Message not found' }, { status: 404 });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to delete message:', error);
            return c.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
        }
    });
    // Mount the admin API router
    app.route('/api', adminApi);
    // Public Routes
    app.post('/api/reviews', async (c) => {
        try {
            const body = await c.req.json<Omit<Review, 'id' | 'createdAt' | 'status'>>();
            if (!body.name || !body.rating || !body.comment) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const newReview = await controller.addReview(body);
            return c.json({ success: true, data: newReview }, { status: 201 });
        } catch (error) {
            console.error('Failed to submit review:', error);
            return c.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
        }
    });
    app.get('/api/reviews/approved', async (c) => {
        try {
            const controller = getAppController(c.env);
            const reviews = await controller.listReviews('approved');
            return c.json({ success: true, data: reviews });
        } catch (error) {
            console.error('Failed to list approved reviews:', error);
            return c.json({ success: false, error: 'Failed to retrieve reviews' }, { status: 500 });
        }
    });
    app.get('/api/banners', async (c) => {
        try {
            const publishedOnly = c.req.query('publishedOnly') === 'true';
            const controller = getAppController(c.env);
            const banners = await controller.listBanners(publishedOnly);
            return c.json({ success: true, data: banners });
        } catch (error) {
            console.error('Failed to list banners:', error);
            return c.json({ success: false, error: 'Failed to retrieve banners' }, { status: 500 });
        }
    });
    app.get('/api/settings', async (c) => {
        try {
            const controller = getAppController(c.env);
            const settings = await controller.getSiteSettings();
            return c.json({ success: true, data: settings });
        } catch (error) {
            console.error('Failed to get site settings:', error);
            return c.json({ success: false, error: 'Failed to retrieve site settings' }, { status: 500 });
        }
    });
    app.get('/api/services', async (c) => {
        try {
            const controller = getAppController(c.env);
            const services = await controller.listServices();
            return c.json({ success: true, data: services });
        } catch (error) {
            console.error('Failed to list services:', error);
            return c.json({ success: false, error: 'Failed to retrieve services' }, { status: 500 });
        }
    });
    app.get('/api/projects', async (c) => {
        try {
            const controller = getAppController(c.env);
            const projects = await controller.listProjects();
            return c.json({ success: true, data: projects });
        } catch (error) {
            console.error('Failed to list projects:', error);
            return c.json({ success: false, error: 'Failed to retrieve projects' }, { status: 500 });
        }
    });
    app.get('/api/blog', async (c) => {
        try {
            const publishedOnly = c.req.query('publishedOnly') === 'true';
            const controller = getAppController(c.env);
            const posts = await controller.listBlogPosts(publishedOnly);
            return c.json({ success: true, data: posts });
        } catch (error) {
            console.error('Failed to list blog posts:', error);
            return c.json({ success: false, error: 'Failed to retrieve blog posts' }, { status: 500 });
        }
    });
    app.get('/api/blog/:slug', async (c) => {
        try {
            const { slug } = c.req.param();
            const controller = getAppController(c.env);
            const posts = await controller.listBlogPosts(true);
            const post = posts.find((p: BlogPost) => p.slug === slug);
            if (!post) return c.json({ success: false, error: 'Post not found' }, { status: 404 });
            return c.json({ success: true, data: post });
        } catch (error) {
            console.error('Failed to get blog post:', error);
            return c.json({ success: false, error: 'Failed to retrieve blog post' }, { status: 500 });
        }
    });
    app.post('/api/contact', async (c) => {
        try {
            const body = await c.req.json();
            if (!body.name || !body.email || !body.message) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const contactMessageData: Omit<ContactMessage, 'id' | 'timestamp' | 'read'> = {
                name: body.name,
                email: body.email,
                message: body.message,
            };
            const controller = getAppController(c.env);
            const storedMessage = await controller.addContactMessage(contactMessageData);
            return c.json({ success: true, data: storedMessage });
        } catch (error) {
            console.error('Failed to process contact message:', error);
            return c.json({ success: false, error: 'Failed to process contact message' }, { status: 500 });
        }
    });
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve sessions'
            }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40
                        ? cleanMessage.slice(0, 37) + '...'
                        : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({
                success: true,
                data: { sessionId, title: sessionTitle }
            });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({
                success: false,
                error: 'Failed to create session'
            }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({
                success: false,
                error: 'Failed to delete session'
            }, { status: 500 });
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') {
                return c.json({
                    success: false,
                    error: 'Title is required'
                }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({
                success: false,
                error: 'Failed to update session title'
            }, { status: 500 });
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({
                success: true,
                data: { deletedCount }
            });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to clear all sessions'
            }, { status: 500 });
        }
    });
}