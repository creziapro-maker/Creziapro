import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
// Public site components
import App from '@/App';
import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { BlogPage } from '@/pages/BlogPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { ContactPage } from '@/pages/ContactPage';
// Admin components
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AdminServicesPage } from '@/pages/admin/AdminServicesPage';
import { AdminPortfolioPage } from '@/pages/admin/AdminPortfolioPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { AdminBlogPage } from '@/pages/admin/AdminBlogPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminBannersPage } from '@/pages/admin/AdminBannersPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "contact", element: <ContactPage /> },
    ]
  },
  // Admin Routes
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "services", element: <AdminServicesPage /> },
      { path: "portfolio", element: <AdminPortfolioPage /> },
      { path: "messages", element: <AdminMessagesPage /> },
      { path: "blog", element: <AdminBlogPage /> },
      { path: "banners", element: <AdminBannersPage /> },
      { path: "reviews", element: <AdminReviewsPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ]
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)