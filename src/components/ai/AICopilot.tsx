import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Bot, X, Send, Sparkles, Activity, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isInitial?: boolean;
}

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your AgenticFi Copilot. How can I assist you with your financial operations today?', isInitial: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Preserve drag position across mounts
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const suggestions = [
    { label: 'Show pending approvals', icon: ChevronRight },
    { label: 'System health status', icon: Activity },
    { label: "Today's fraud summary", icon: ShieldAlert },
    { label: 'Generate executive report', icon: FileText },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.text || "Sorry, I couldn't generate a response."
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, I am having trouble connecting to the backend right now."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              drag
              dragMomentum={false}
              style={{ x: dragX, y: dragY }}
              whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handleOpen}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-grab"
            >
              <div className="absolute inset-0 rounded-full animate-ping bg-primary/40 group-hover:bg-primary/50" style={{ animationDuration: '3s' }} />
              <Bot size={28} className="relative z-10" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragHandle=".drag-handle"
            style={{ x: dragX, y: dragY }}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] origin-bottom-right"
          >
            <Card className="h-[550px] flex flex-col border-white/10 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="p-4 border-b border-border bg-black/20 flex flex-row items-center justify-between space-y-0 relative overflow-hidden drag-handle cursor-move">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-400 to-primary opacity-80" />
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Bot size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">AgenticFi Copilot</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={() => setIsOpen(false)}>
                  <X size={18} />
                </Button>
              </CardHeader>
              
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex w-full gap-2", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                      {msg.sender === 'ai' && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-1">
                          <Sparkles size={12} />
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-2 text-sm max-w-[85%]",
                        msg.sender === 'user' 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-muted text-foreground rounded-tl-sm"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex w-full gap-2 justify-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-1">
                        <Sparkles size={12} />
                      </div>
                      <div className="rounded-2xl px-4 py-3 text-sm max-w-[85%] bg-muted text-foreground rounded-tl-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {messages.length < 3 && (
                  <div className="p-3 border-t border-border/50 bg-black/10">
                    <p className="text-xs text-muted-foreground mb-2 px-1">Suggested queries</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion.label)}
                          className="flex items-center gap-1.5 text-xs bg-muted/50 hover:bg-muted text-foreground px-2.5 py-1.5 rounded-full border border-border/50 transition-colors text-left"
                        >
                          <suggestion.icon size={12} className="text-muted-foreground" />
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                    className="flex relative items-center"
                  >
                    <Input 
                      placeholder="Ask the AI copilot..." 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="pr-10 bg-black/20 border-white/10 rounded-full focus-visible:ring-primary/50 text-sm h-10"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!inputValue.trim() || isTyping}
                      className="absolute right-1 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                    >
                      <Send size={14} className="ml-0.5" />
                    </Button>
                  </form>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    AI generated responses may be inaccurate.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
