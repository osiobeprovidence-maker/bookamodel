import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../../components/ui/Toast';

type Ticket = {
  id: string;
  userName: string;
  subject: string;
  message: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  Resolved: 'bg-green-100 text-green-700',
};

const filters = ['All', 'Open', 'In Progress', 'Resolved'];

export default function AdminSupport() {
  const { showToast } = useToast();
  const data = useQuery(api.admin.listSupportTickets);
  const setTicketStatus = useMutation(api.admin.setTicketStatus);
  const [localTickets, setLocalTickets] = useState<Ticket[] | null>(null);
  useEffect(() => {
    if (data && localTickets === null) setLocalTickets(data as unknown as Ticket[]);
  }, [data, localTickets]);
  const tickets = localTickets ?? [];
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');

  const filtered = tickets.filter((t) => {
    const matchFilter = activeFilter === 'All' || t.status === activeFilter;
    const matchSearch =
      search === '' ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
    avgResponse: '2.4 hrs',
  };

  const toggleExpand = (id: string) => {
    setSelectedTicket(selectedTicket === id ? null : id);
    setReplyText('');
  };

  const sendReply = (ticketId: string) => {
    if (!replyText.trim()) {
      showToast('Reply cannot be empty', 'error');
      return;
    }
    showToast('Reply sent successfully', 'success');
    setReplyText('');
  };

  const changeStatus = (ticketId: string, newStatus: Ticket['status']) => {
    setLocalTickets((prev) =>
      prev ? prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)) : prev
    );
    setTicketStatus({
      ticketId,
      status: newStatus === 'In Progress' ? 'in_progress' : newStatus === 'Resolved' ? 'resolved' : 'open',
    });
    showToast(`Ticket marked as ${newStatus}`, 'success');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Support</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Open Tickets</p>
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Avg Response Time</p>
          <p className="text-2xl font-bold">{stats.avgResponse}</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by subject or user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg border overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(ticket.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{ticket.userName}</span>
                      <span className="text-xs text-gray-400">{ticket.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.message}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTicket === ticket.id && (
                <div className="border-t p-4 space-y-4 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Full Message</p>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded border">{ticket.message}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 h-24"
                      placeholder="Type your reply..."
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => sendReply(ticket.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Send Reply
                    </button>
                    {ticket.status !== 'In Progress' && (
                      <button
                        onClick={() => changeStatus(ticket.id, 'In Progress')}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {ticket.status !== 'Resolved' && (
                      <button
                        onClick={() => changeStatus(ticket.id, 'Resolved')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
