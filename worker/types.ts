export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
}
export type ToolResult = WeatherResult | { content: string } | ErrorResult;
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: ToolResult;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  read: boolean;
}
export interface PricingBand {
  label: string;
  min: number;
  max: number;
}
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  features: string[];
  pricingBands: PricingBand[];
}
export interface Project {
  id: string;
  title: string;
  description: string;
  image: string; // URL
  status: 'Ongoing' | 'Completed';
  tags: string[];
}
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: number;
}
export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  contactEmail: string;
  contactPhone: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  chatbotPrompt: string;
}
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  published: boolean;
}
export interface AdminSession {
  userId: string; // Could be an email or a unique ID
  expires: number;
}
export interface Review {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'approved';
  createdAt: number;
}
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}