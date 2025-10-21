# Creziapro

An AI-powered, all-in-one website for MSMEs, featuring a dynamic public interface, an intelligent service & pricing chatbot, built on a high-performance Cloudflare serverless stack.

[cloudflarebutton]

---

## About The Project

Creziapro is a sophisticated, AI-powered web platform designed for MSMEs, providing an all-in-one public website and a future-planned admin console. The platform is built on a high-performance, serverless stack using Cloudflare Workers and Durable Objects.

The public-facing website is designed with a minimalist and futuristic aesthetic, featuring dynamic content sections for services, portfolio, and blogs. The core interactive element is an AI-powered chatbot, available as a floating widget, which assists users by recommending services and providing instant price estimates based on their requirements.

This project leverages a powerful Cloudflare template to ensure maximum performance, scalability, and security by running on the edge.

### Key Features

*   **Stunning Public Website:** A visually breathtaking and fully responsive public website for Creziapro, including Home, Services, Portfolio, Blog, and Contact pages.
*   **Intelligent AI Chatbot:** A floating widget that leverages a Cloudflare Agents backend to understand user needs and provide instant service recommendations and price quotes.
*   **High-Performance Stack:** Built on Cloudflare Workers and Durable Objects for a fast, scalable, and secure serverless architecture.
*   **Modern UI/UX:** Meticulously crafted to reflect a minimalist, modern, and trustworthy brand identity using shadcn/ui and Framer Motion.
*   **MSME Focused:** Designed with the needs of MSME-registered companies in mind, including branding elements like the "MSME Registered" badge.

## Technology Stack

This project is built with a modern, serverless-first technology stack:

*   **Frontend:**
    *   [React](https://reactjs.org/)
    *   [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Framer Motion](https://www.framer.com/motion/)
    *   [Zustand](https://zustand-demo.pmnd.rs/) for state management
*   **Backend:**
    *   [Cloudflare Workers](https://workers.cloudflare.com/)
    *   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
    *   [Hono](https://hono.dev/)
*   **AI & Agents:**
    *   [Cloudflare Agents SDK](https://developers.cloudflare.com/workers/agents/)
    *   [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/)
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/creziapro.git
    cd creziapro
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project for local development. You can copy the example:
    ```sh
    cp .dev.vars.example .dev.vars
    ```
    Now, edit `.dev.vars` and add your Cloudflare AI Gateway credentials:
    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

## Development

To run the application in development mode, which includes hot-reloading for both the frontend and the worker:

```sh
bun run dev
```

This will start the Vite development server for the frontend, typically on `http://localhost:3000`. The Cloudflare Worker backend will also be running locally, and API requests from the frontend will be automatically proxied.

## Deployment

This project is designed for seamless deployment to Cloudflare.

### One-Click Deploy

You can deploy this application to your Cloudflare account with a single click.

[cloudflarebutton]

### Manual Deployment via Wrangler

1.  **Login to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account.
    ```sh
    bunx wrangler login
    ```

2.  **Build and Deploy:**
    The `deploy` script handles building the frontend application and deploying it along with the worker to Cloudflare.
    ```sh
    bun run deploy
    ```

After deployment, Wrangler will output the URL of your live application. Production environment variables should be configured in the Cloudflare dashboard under your Worker's settings.

## Project Structure

*   `src/`: Contains all the frontend React application code, including pages, components, and hooks.
*   `worker/`: Contains all the backend Cloudflare Worker and Durable Object code, including API routes and AI logic.
*   `wrangler.jsonc`: The configuration file for the Cloudflare Worker, including bindings to Durable Objects and environment variables.
*   `tailwind.config.js`: Configuration for Tailwind CSS.
*   `vite.config.ts`: Configuration for the Vite frontend build tool.

## License

Distributed under the MIT License. See `LICENSE` for more information.