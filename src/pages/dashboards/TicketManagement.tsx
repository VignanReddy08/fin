import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Clock, User, FileText, CheckCircle2, 
  AlertTriangle, Send, Paperclip, ArrowLeft, BookOpen, 
  ShieldAlert, Check, X, ChevronRight, MessageSquare 
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { getOperationalStats, updateTicketStatus } from '../../lib/operationsStore';
import { getCurrentUser } from '../../lib/authStore';

export default function TicketManagement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getCurrentUser() || { fullName: 'Guest User', role: 'customer' };
  const isCustomer = user.role === 'customer';

  // State Management
  const [stats, setStats] = useState(getOperationalStats());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(searchParams.get('id'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [reviewComment, setReviewComment] = useState('');

  // Customer portal support reply mock
  const [customerMessage, setCustomerMessage] = useState('');
  const [conversationLogs, setConversationLogs] = useState<Record<string, Array<{ sender: 'user' | 'ai' | 'admin', text: string, time: string }>>>({});

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const ticketsList = stats.requests;

  // Filter list by role
  const roleFilteredTickets = isCustomer
    ? ticketsList.filter(t => t.customerName === user.fullName || t.customerName === 'Customer Portal Guest')
    : ticketsList;

  // Search & Filter
  const filteredTickets = roleFilteredTickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Auto-select first ticket if none selected
  useEffect(() => {
    if (filteredTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId]);

  const selectedTicket = filteredTickets.find(t => t.id === selectedTicketId) || filteredTickets[0];

  // Initialize mock conversation logs per ticket if empty
  const getTicketConversation = (ticketId: string, initialDetails: string) => {
    if (conversationLogs[ticketId]) return conversationLogs[ticketId];
    
    // Parse subject / message
    const cleanDetails = initialDetails.replace(/^\[.*?\]\s*/, '');
    
    const initialThread = [
      { sender: 'user' as const, text: cleanDetails, time: 'Just now' },
      { 
        sender: 'ai' as const, 
        text: `I have analyzed your query regarding "${cleanDetails.slice(0, 40)}...". I classified this under ${selectedTicket?.category || 'Support'} operations.`, 
        time: '1s after submission' 
      }
    ];

    if (selectedTicket?.status === 'Resolved') {
      initialThread.push({
        sender: 'ai' as const,
        text: `Based on SOP-REF-09 (Refund limits) and transaction policy verification, this case has been auto-resolved.`,
        time: '3s after submission'
      });
    } else if (selectedTicket?.status === 'Requires Approval') {
      initialThread.push({
        sender: 'ai' as const,
        text: `This transaction exceeds standard auto-approval thresholds. Flagging for Human Review validation.`,
        time: '5s after submission'
      });
    }

    conversationLogs[ticketId] = initialThread;
    return initialThread;
  };

  const handleSendCustomerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim() || !selectedTicket) return;

    const thread = getTicketConversation(selectedTicket.id, selectedTicket.details);
    const updated = [...thread, { sender: 'user' as const, text: customerMessage, time: 'Just now' }];
    
    setConversationLogs({
      ...conversationLogs,
      [selectedTicket.id]: updated
    });
    setCustomerMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiReply = {
        sender: 'ai' as const,
        text: `Understood. I am adding these details to the investigation log. The current dispatch status is: ${selectedTicket.status}. Our support operations crew will review if escalated.`,
        time: 'Just now'
      };
      setConversationLogs(prev => ({
        ...prev,
        [selectedTicket.id]: [...updated, aiReply]
      }));
    }, 1500);
  };

  const handleAdminAction = (actionStatus: 'Resolved' | 'Escalated') => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, actionStatus, reviewComment);
    
    // Log comment in conversation too
    if (reviewComment.trim()) {
      const thread = getTicketConversation(selectedTicket.id, selectedTicket.details);
      setConversationLogs({
        ...conversationLogs,
        [selectedTicket.id]: [...thread, { sender: 'admin' as const, text: `[Admin action: ${actionStatus}] ${reviewComment}`, time: 'Just now' }]
      });
    }

    setReviewComment('');
    setStats(getOperationalStats());
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            {isCustomer ? 'My Support Tickets' : 'Enterprise Tickets Workspace'}
          </h1>
          <p className="text-sm text-gray-400">
            {isCustomer ? 'Track your active support requests, disputes, and resolution status.' : 'Perform audits, trigger manual actions, and manage client operations.'}
          </p>
        </div>
        {isCustomer && (
          <Button onClick={() => navigate('/app/tickets/new')} size="sm">
            Raise New Ticket
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Tickets Table / List */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by ID, Category, Customer..." 
                className="pl-9 bg-black/20 border-border text-white text-xs h-9 focus-visible:ring-primary" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!isCustomer && (
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Statuses</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Requires Approval">Requires Approval</option>
                  <option value="Escalated">Escalated</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            )}
          </div>

          {filteredTickets.length === 0 ? (
            <Card className="border-dashed border-border py-12 text-center bg-card/10">
              <CardContent className="space-y-3">
                <FileText className="h-10 w-10 text-gray-500 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No tickets match criteria</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {isCustomer ? 'You do not have any active support requests.' : 'No customer tickets require audit actions currently.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-card/30 border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-card/80">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-gray-300">Ticket ID</TableHead>
                    {!isCustomer && <TableHead className="text-xs font-bold text-gray-300">Customer</TableHead>}
                    <TableHead className="text-xs font-bold text-gray-300">Category</TableHead>
                    <TableHead className="text-xs font-bold text-gray-300">Status</TableHead>
                    <TableHead className="text-xs font-bold text-gray-300">Priority</TableHead>
                    <TableHead className="text-xs font-bold text-gray-300">AI Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`cursor-pointer border-border/40 hover:bg-primary/5 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-primary/10 border-primary/20' : ''}`}
                    >
                      <TableCell className="font-mono text-xs font-bold text-primary">{ticket.id}</TableCell>
                      {!isCustomer && <TableCell className="text-xs text-gray-200">{ticket.customerName}</TableCell>}
                      <TableCell className="text-xs text-gray-300 font-medium">{ticket.category}</TableCell>
                      <TableCell>
                        <Badge className={
                          ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]' :
                          ticket.status === 'Requires Approval' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px]' :
                          'bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]'
                        }>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          ticket.priority === 'Critical' ? 'bg-red-500/5 text-red-400 border-red-500/20 text-[10px]' :
                          ticket.priority === 'High' ? 'bg-orange-500/5 text-orange-400 border-orange-500/20 text-[10px]' :
                          'bg-gray-800 text-gray-400 border-border text-[10px]'
                        }>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 font-mono">{ticket.agent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Workspace View */}
        {selectedTicket && (
          <div className="w-full lg:w-[420px] shrink-0 space-y-4">
            <Card className="border-border bg-card/40">
              <CardHeader className="border-b border-border/60 pb-3 bg-card/75">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{selectedTicket.id}</span>
                    <CardTitle className="text-base text-white font-bold mt-0.5">{selectedTicket.category}</CardTitle>
                  </div>
                  <Badge className={
                    selectedTicket.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                    selectedTicket.status === 'Requires Approval' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/15 text-red-400 border border-red-500/30'
                  }>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] border-border text-gray-400">{selectedTicket.priority} Priority</Badge>
                  <Badge variant="outline" className="text-[10px] border-border text-gray-400">Risk: {selectedTicket.risk}</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Segment 1: Customer Details */}
                {!isCustomer && (
                  <div className="p-3 rounded-lg bg-black/10 border border-border/40 space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Customer Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                      <div>
                        <span className="text-gray-500 block">Full Name</span>
                        <span className="font-medium text-white">{selectedTicket.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Status</span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Verified Account
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Segment 2: AI Reasoning Stream / References */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                  <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> AI Reasoning & RAG References
                  </h4>
                  <div className="text-[11px] text-gray-400 space-y-1 font-mono">
                    <p className="flex items-start gap-1"><span className="text-primary font-bold">Intent:</span> {selectedTicket.category}</p>
                    <p className="flex items-start gap-1"><span className="text-primary font-bold">Conf:</span> {selectedTicket.confidence}%</p>
                    <p className="flex items-start gap-1">
                      <span className="text-primary font-bold">SOP Doc:</span>
                      <span className="text-white hover:underline cursor-pointer">
                        {selectedTicket.category.toLowerCase().includes('refund') ? 'SOP-REF-09 (Refund approvals limit)' : 'SOP-SEC-12 (Account lockout SOP)'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Segment 3: Chat / Action Thread */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-400" /> Conversation Logs
                  </h4>
                  <div className="h-44 overflow-y-auto bg-black/10 border border-border/50 rounded-lg p-2.5 space-y-3">
                    {getTicketConversation(selectedTicket.id, selectedTicket.details).map((msg, idx) => (
                      <div key={idx} className={`space-y-0.5 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span>{msg.sender === 'user' ? 'Customer' : msg.sender === 'ai' ? `AI Agent [${selectedTicket.agent}]` : 'Administrator'}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className={`p-2 rounded text-[11px] inline-block text-left ${
                          msg.sender === 'user' ? 'bg-primary text-white ml-6 rounded-tr-none' : 
                          msg.sender === 'ai' ? 'bg-card border border-border text-gray-300 mr-6 rounded-tl-none' :
                          'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 mr-6 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isCustomer ? (
                    <form onSubmit={handleSendCustomerMessage} className="flex gap-2">
                      <Input 
                        placeholder="Add message details..." 
                        className="bg-black/25 text-xs border-border h-8 flex-1"
                        value={customerMessage}
                        onChange={(e) => setCustomerMessage(e.target.value)}
                      />
                      <Button type="submit" size="sm" className="h-8 px-3 shrink-0">Send</Button>
                    </form>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <label className="text-[11px] font-medium text-gray-400">Auditor Audit Logs / Comments</label>
                      <textarea
                        placeholder="Enter review comments for state overrides (Approve/Escalate/Close)..."
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded border border-border bg-black/20 p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={() => handleAdminAction('Resolved')} 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-500/5 gap-1"
                        >
                          <Check className="h-3 w-3" /> Approve & Close
                        </Button>
                        <Button 
                          onClick={() => handleAdminAction('Escalated')} 
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 bg-red-500/5 gap-1"
                        >
                          <AlertTriangle className="h-3 w-3" /> Escalate Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
