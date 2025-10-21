import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatService } from '@/lib/chat';
import { cn } from '@/lib/utils';
import type { Message } from '../../../worker/types';
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      const loadMessages = async () => {
        setIsLoading(true);
        const response = await chatService.getMessages();
        if (response.success && response.data) {
          setMessages(response.data.messages);
        }
        setIsLoading(false);
      };
      loadMessages();
    }
  }, [isOpen]);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, streamingMessage]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessageContent = input;
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    await chatService.sendMessage(userMessageContent, undefined, (chunk) => {
      setStreamingMessage((prev) => prev + chunk);
    });
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setMessages(response.data.messages);
    }
    setIsLoading(false);
    setStreamingMessage('');
  };
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-[calc(100vw-3rem)] sm:w-96 h-[70vh] sm:h-[600px] mb-4"
            >
              <Card className="h-full flex flex-col shadow-2xl border-border/20">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Creziapro Assistant</h3>
                      <p className="text-sm text-muted-foreground">How can I help you today?</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={cn('flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                          {msg.role === 'assistant' && <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                          <div className={cn('max-w-[80%] rounded-2xl px-4 py-2 text-pretty', msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none')}>
                            {msg.content}
                          </div>
                          {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                        </div>
                      ))}
                      {streamingMessage && (
                        <div className="flex items-end gap-2 justify-start">
                          <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                          <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted text-muted-foreground rounded-bl-none">
                            {streamingMessage}<span className="animate-pulse">|</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about services, pricing..."
                      className="flex-1 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </CardFooter>
                <div className="px-4 pb-2 text-center text-xs text-muted-foreground/70 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>AI requests may be limited.</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 bg-crezia-orange hover:bg-crezia-orange/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <AnimatePresence>
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
                <X className="h-8 w-8 text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }}>
                <MessageSquare className="h-8 w-8 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </>
  );
}