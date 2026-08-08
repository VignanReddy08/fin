import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Ticket, PlusCircle, HelpCircle, ArrowRight, ShieldCheck, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { getOperationalStats } from '../../lib/operationsStore';
import { getCurrentUser } from '../../lib/authStore';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { fullName: 'Customer' };
  
  // Fetch overall operational tickets
  const stats = getOperationalStats();
  
  // Filter tickets raised by this customer. In a real app we query by customerName or customerId.
  // Our seed customers are "Vikram Patel", "Meera Reddy", etc.
  const myTickets = stats.requests.filter(
    (req) => req.customerName === user.fullName || req.customerName === 'Customer Portal Guest'
  );

  const openTickets = myTickets.filter(t => t.status === 'Requires Approval' || t.status === 'Escalated').length;
  const resolvedTickets = myTickets.filter(t => t.status === 'Resolved').length;
  const inProgressTickets = myTickets.length - openTickets - resolvedTickets;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-sm text-gray-400">
            Manage your support tickets and view real-time resolution updates.
          </p>
        </div>
        <Button onClick={() => navigate('/app/tickets/new')} className="gap-2 shadow-lg shadow-primary/20">
          <PlusCircle className="h-4 w-4" /> Raise Support Ticket
        </Button>
      </div>

      {/* Synchronized Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-primary animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{openTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review or automated dispatch</p>
          </CardContent>
        </Card>

        <Card className="hover:border-yellow-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Processing/Escalated</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inProgressTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Under AI or manual escalation audits</p>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{resolvedTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully closed by dispatcher</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Recent Tickets List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Recent Support Tickets</CardTitle>
            <CardDescription className="text-xs">Your raised operational disputes and queries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTickets.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">No active support tickets</h4>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    If you are experiencing issues with payouts, charges, or general profile access, open a support ticket to trigger our autonomous dispatch network.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/app/tickets/new')} className="gap-2">
                  <PlusCircle className="h-3.5 w-3.5" /> Open a Ticket
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {myTickets.map((ticket) => (
                  <div key={ticket.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{ticket.id}</span>
                        <h4 className="text-sm font-semibold text-white hover:underline cursor-pointer" onClick={() => navigate(`/app/tickets?id=${ticket.id}`)}>
                          {ticket.category}
                        </h4>
                        <Badge variant="outline" className={
                          ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20 text-[10px]' :
                          ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]'
                        }>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 max-w-md">{ticket.details}</p>
                      <span className="text-[10px] text-gray-500 block">
                        Raised {new Date(ticket.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <Badge className={
                        ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        ticket.status === 'Requires Approval' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }>
                        {ticket.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:text-white" onClick={() => navigate(`/app/tickets?id=${ticket.id}`)}>
                        View Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Support Guidelines & Trust */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Security & Trust Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <p>
                FinMatrix operates a state-of-the-art secure RAG agent network designed to solve client questions instantaneously.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>SSL / TLS 1.3 Transport</li>
                <li>ISO 27001 Certified Gateways</li>
                <li>AES-256 Storage Encryption</li>
                <li>HIL Audit-Locked Approvals</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> FAQ & Agent Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <p>
                Need immediate help? Browse our indexed manuals:
              </p>
              <div className="space-y-2">
                <div className="p-2 rounded bg-card hover:bg-muted border border-border cursor-pointer transition-colors">
                  <p className="font-semibold text-white">Refund Limits Policy</p>
                  <p className="text-[10px] text-gray-500">Manual ID: SOP-REF-09</p>
                </div>
                <div className="p-2 rounded bg-card hover:bg-muted border border-border cursor-pointer transition-colors">
                  <p className="font-semibold text-white">Security Breach Lockout SOP</p>
                  <p className="text-[10px] text-gray-500">Manual ID: SOP-SEC-12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
