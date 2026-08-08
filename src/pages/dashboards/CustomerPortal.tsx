import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Bot, Send, User, Paperclip, CheckCircle } from 'lucide-react';
import { addCustomerRequest, getOperationalStats } from '../../lib/operationsStore';

export default function CustomerPortal() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your AgenticFi support assistant. How can I help you today? (e.g. Try typing "I need a refund for transaction TXN-8938")' },
  ]);
  const [input, setInput] = useState('');
  const [ticketRaised, setTicketRaised] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setInput('');

    // Dynamically categorize and raise a real ticket in the operationsStore
    let category = 'General Help';
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    if (userMessage.toLowerCase().includes('refund') || userMessage.toLowerCase().includes('dispute')) {
      category = 'Refund Claim';
    } else if (userMessage.toLowerCase().includes('payment') || userMessage.toLowerCase().includes('charge')) {
      category = 'Payment Failure';
      priority = 'High';
    } else if (userMessage.toLowerCase().includes('lock') || userMessage.toLowerCase().includes('security') || userMessage.toLowerCase().includes('fraud')) {
      category = 'Account Security';
      priority = 'Critical';
    }

    // Add to store
    const ticket = addCustomerRequest('Customer Portal Guest', category, userMessage, priority);
    setTicketRaised(true);

    setTimeout(() => {
      const responseText = ticket.status === 'Requires Approval' 
        ? `I have classified this as a ${category} (${priority} Priority) and flagged it for manual Manager audit due to transaction policy limits. Ticket ID: ${ticket.id}.`
        : `Ticket ${ticket.id} successfully auto-resolved by our ${ticket.agent} with ${ticket.confidence}% confidence. Resolution action logged.`;

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: responseText
      }]);
      setTimeout(() => setTicketRaised(false), 3000);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Customer Support Center</h1>
          <p className="text-sm text-gray-400">Get instant help from our AI Agent Network.</p>
        </div>
        {ticketRaised && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs py-1">
            <CheckCircle className="h-3 w-3 mr-1 inline" /> Real Ticket Raised
          </Badge>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border bg-card/30">
        <CardHeader className="border-b border-border bg-card/60 py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Bot className="h-4 w-4 text-primary" />
             </div>
             <div>
                Agentic Support Gateway
                <p className="text-xs text-success font-normal">Online - Dynamic AI Dispatcher</p>
             </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 min-h-[350px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-muted' : 'bg-primary/20 border border-primary/30'}`}>
                {msg.sender === 'user' ? <User className="h-4 w-4 text-gray-300" /> : <Bot className="h-4 w-4 text-primary" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-card border border-border text-gray-200'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </CardContent>

        <div className="p-4 bg-card/60 border-t border-border">
           <form onSubmit={handleSend} className="flex items-center gap-2 relative">
              <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white shrink-0">
                 <Paperclip className="h-5 w-5" />
              </Button>
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your query (e.g. 'chargeback for transfer of ₹45,000')..." 
                className="flex-1 rounded-full bg-background border-border pl-4 pr-12 h-10 text-white" 
              />
              <Button type="submit" size="icon" className="absolute right-1 h-8 w-8 rounded-full shrink-0" disabled={!input.trim()}>
                 <Send className="h-4 w-4" />
              </Button>
           </form>
        </div>
      </Card>
    </div>
  );
}
