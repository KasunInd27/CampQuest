// components/admin/AdminSupportTickets.jsx
import React, { useState, useEffect } from 'react';
import { LifeBuoy, Eye, Trash2, Filter, Search, Clock, CheckCircle, AlertTriangle, Reply, X, Download, BarChart } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    page: 1,
    limit: 100
  });

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add filters to params
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axios.get(`/support-tickets?${params.toString()}`);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/support-tickets/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleReplyTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowReplyModal(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`/support-tickets/${ticketId}`);
      if (response.data.success) {
        toast.success('Ticket deleted successfully');
        fetchTickets();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const response = await axios.put(`/support-tickets/${ticketId}`, { status });
      if (response.data.success) {
        toast.success('Ticket status updated successfully');
        fetchTickets();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const exportToPDF = async () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Add modern header
      doc.setFillColor(139, 195, 74);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Add title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('Support Tickets Report', pageWidth / 2, 20, { align: 'center' });

      // Add filters info
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const filterText = `Status: ${filters.status === 'all' ? 'All' : filters.status} | Category: ${filters.category === 'all' ? 'All' : filters.category} | Priority: ${filters.priority === 'all' ? 'All' : filters.priority}`;
      doc.text(filterText, pageWidth / 2, 30, { align: 'center' });

      // Add generation date
      const dateText = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(dateText, pageWidth / 2, 36, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Add statistics summary
      let yPosition = 50;

      if (stats) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPosition, pageWidth - 28, 40, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(51, 51, 51);
        doc.text('Summary Statistics', 20, yPosition + 10);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(85, 85, 85);

        const col1X = 20;
        const col2X = pageWidth / 2;
        const col3X = pageWidth - 60;

        doc.text(`Total Tickets: ${stats.totalTickets}`, col1X, yPosition + 20);
        doc.text(`Open: ${stats.openTickets}`, col2X, yPosition + 20);
        doc.text(`Resolved: ${stats.resolvedTickets}`, col3X, yPosition + 20);

        doc.text(`In Progress: ${stats.inProgressTickets}`, col1X, yPosition + 28);
        doc.text(`Closed: ${stats.closedTickets}`, col2X, yPosition + 28);
        doc.text(`Recent (7 days): ${stats.recentTickets}`, col3X, yPosition + 28);

        yPosition += 50;
      }

      // Prepare table data
      const tableData = tickets.map((ticket, index) => [
        index + 1,
        `#${ticket._id.slice(-6)}`,
        ticket.subject.substring(0, 35) + (ticket.subject.length > 35 ? '...' : ''),
        ticket.customerName || ticket.user?.name || 'N/A',
        ticket.customerEmail || ticket.user?.email || 'N/A',
        ticket.category.toUpperCase(),
        ticket.priority.toUpperCase(),
        ticket.status.toUpperCase(),
        new Date(ticket.createdAt).toLocaleDateString()
      ]);

      // Add table
      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'ID', 'Subject', 'Customer', 'Email', 'Category', 'Priority', 'Status', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [139, 195, 74],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [51, 51, 51]
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 20, halign: 'center' },
          8: { cellWidth: 22, halign: 'center' }
        },
        margin: { top: 10, left: 14, right: 14 },
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });

      // Add detailed tickets section
      if (tickets.length > 0) {
        doc.addPage();
        yPosition = 20;

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(51, 51, 51);
        doc.text('Detailed Ticket Information', 20, yPosition);

        yPosition += 10;

        tickets.forEach((ticket, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 70) {
            doc.addPage();
            yPosition = 20;
          }

          // Ticket box
          doc.setFillColor(245, 248, 250);
          doc.roundedRect(14, yPosition, pageWidth - 28, 60, 2, 2, 'F');

          // Ticket ID and subject
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(51, 51, 51);
          doc.text(`${index + 1}. #${ticket._id.slice(-6)} - ${ticket.subject}`, 20, yPosition + 8);

          // Customer info
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(85, 85, 85);
          doc.text(`Customer: ${ticket.customerName || ticket.user?.name || 'N/A'}`, 20, yPosition + 16);
          doc.text(`Email: ${ticket.customerEmail || ticket.user?.email || 'N/A'}`, 20, yPosition + 23);

          // Ticket details
          doc.text(`Category: ${ticket.category.toUpperCase()}`, 20, yPosition + 30);
          doc.text(`Priority: ${ticket.priority.toUpperCase()}`, 80, yPosition + 30);
          doc.text(`Status: ${ticket.status.toUpperCase()}`, 130, yPosition + 30);

          // Date
          doc.text(`Created: ${new Date(ticket.createdAt).toLocaleDateString()}`, 20, yPosition + 37);

          // Description
          doc.setFontSize(8);
          doc.setTextColor(68, 68, 68);
          const splitDescription = doc.splitTextToSize(ticket.description, pageWidth - 48);
          doc.text(splitDescription.slice(0, 2), 20, yPosition + 45);

          // Replies count
          if (ticket.replies && ticket.replies.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(139, 195, 74);
            doc.text(`${ticket.replies.length} ${ticket.replies.length === 1 ? 'Reply' : 'Replies'}`, 20, yPosition + 56);
          }

          yPosition += 68;
        });
      }

      // Save the PDF
      const fileName = `support-tickets-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'text-yellow-400 bg-yellow-400/10',
      'in-progress': 'text-blue-400 bg-blue-400/10',
      resolved: 'text-green-400 bg-green-400/10',
      closed: 'text-neutral-400 bg-neutral-400/10'
    };
    return colors[status] || 'text-neutral-400 bg-neutral-400/10';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || 'text-neutral-400';
  };

  // Prepare chart data
  const statusChartData = stats?.statusBreakdown?.map(item => ({
    name: item._id.replace('-', ' ').toUpperCase(),
    value: item.count,
    status: item._id
  })) || [];

  const categoryChartData = stats?.categoryBreakdown?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  const priorityChartData = stats?.priorityBreakdown?.map(item => ({
    name: item._id.toUpperCase(),
    value: item.count
  })) || [];

  const STATUS_COLORS = {
    'open': '#eab308',
    'in-progress': '#3b82f6',
    'resolved': '#22c55e',
    'closed': '#737373'
  };

  const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const PRIORITY_COLORS = {
    'low': '#22c55e',
    'medium': '#eab308',
    'high': '#f97316',
    'urgent': '#ef4444'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-neutral-400">Manage customer support requests</p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={exportingPDF || tickets.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-lime-500 text-black font-medium rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export as PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tickets"
            value={stats.totalTickets}
            icon={<LifeBuoy className="w-6 h-6 text-blue-400" />}
          />
          <StatsCard
            title="Open Tickets"
            value={stats.openTickets}
            icon={<Clock className="w-6 h-6 text-yellow-400" />}
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTickets}
            icon={<AlertTriangle className="w-6 h-6 text-orange-400" />}
          />
          <StatsCard
            title="Resolved"
            value={stats.resolvedTickets}
            icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          />
        </div>
      )}

      {/* Charts Section */}
      {stats && (statusChartData.length > 0 || categoryChartData.length > 0 || priorityChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          {statusChartData.length > 0 && (
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-lime-500" />
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#262626',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value) => <span style={{ color: '#d4d4d4' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Distribution */}
          {categoryChartData.length > 0 && (
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-lime-500" />
                Category Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#262626',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value) => <span style={{ color: '#d4d4d4' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Priority Distribution */}
          {priorityChartData.length > 0 && (
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-lime-500" />
                Priority Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name.toLowerCase()]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#262626',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value) => <span style={{ color: '#d4d4d4' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-lime-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filter Tickets</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="equipment">Equipment</option>
            <option value="general">General</option>
            <option value="complaint">Complaint</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
        </div>
        {(filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.search) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-400">
              Showing {tickets.length} filtered result{tickets.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setFilters({ status: 'all', category: 'all', priority: 'all', search: '', page: 1, limit: 100 })}
              className="text-sm text-lime-500 hover:text-lime-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <LifeBuoy className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No support tickets found</p>
                    {(filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.search) && (
                      <p className="text-neutral-500 text-sm mt-1">Try adjusting your filters</p>
                    )}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <TicketTableRow
                    key={ticket._id}
                    ticket={ticket}
                    onView={() => handleViewTicket(ticket)}
                    onReply={() => handleReplyTicket(ticket)}
                    onDelete={() => handleDeleteTicket(ticket._id)}
                    onStatusUpdate={updateTicketStatus}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showTicketModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
          }}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
        />
      )}

      {showReplyModal && selectedTicket && (
        <TicketReplyModal
          ticket={selectedTicket}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedTicket(null);
          }}
          onSuccess={() => {
            fetchTickets();
            fetchStats();
            setShowReplyModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon }) => (
  <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-lime-500 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-400">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

// Ticket Table Row Component
const TicketTableRow = ({
  ticket,
  onView,
  onReply,
  onDelete,
  onStatusUpdate,
  getStatusColor,
  getPriorityColor
}) => {
  return (
    <tr className="hover:bg-neutral-800 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-white">#{ticket._id.slice(-6)}</div>
          <div className="text-sm text-neutral-400 truncate max-w-xs">
            {ticket.subject}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-white">{ticket.customerName || ticket.user?.name || 'N/A'}</div>
          <div className="text-sm text-neutral-400">{ticket.customerEmail || ticket.user?.email || 'N/A'}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-white capitalize">{ticket.category}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <select
          value={ticket.status}
          onChange={(e) => onStatusUpdate(ticket._id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(ticket.status)}`}
        >
          <option value="open" className='bg-neutral-900 text-white'>Open</option>
          <option value="in-progress" className='bg-neutral-900 text-white'>In Progress</option>
          <option value="resolved" className='bg-neutral-900 text-white'>Resolved</option>
          <option value="closed" className='bg-neutral-900 text-white'>Closed</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-white">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onView}
            className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-700 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onReply}
            className="p-2 text-neutral-400 hover:text-lime-500 hover:bg-neutral-700 rounded-lg transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-700 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Ticket Details Modal Component
const TicketDetailsModal = ({ ticket, onClose, getStatusColor, getPriorityColor }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-neutral-900 border border-lime-500 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Support Ticket Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ticket Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400">Ticket ID</p>
                <p className="text-white font-medium">#{ticket._id}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Subject</p>
                <p className="text-white font-medium">{ticket.subject}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Category</p>
                <p className="text-white font-medium capitalize">{ticket.category}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Priority</p>
                <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Created</p>
                <p className="text-white font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400">Name</p>
                <p className="text-white font-medium">{ticket.customerName || ticket.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Email</p>
                <p className="text-white font-medium">{ticket.customerEmail || ticket.user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
          <div className="bg-neutral-800 rounded-lg p-4">
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        {/* Replies */}
        {ticket.replies && ticket.replies.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Conversation ({ticket.replies.length})</h3>
            <div className="space-y-4">
              {ticket.replies.map((reply, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${reply.authorType === 'admin'
                      ? 'bg-lime-500/10 border border-lime-500/20'
                      : 'bg-neutral-800 border border-neutral-700'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.authorType === 'admin' ? 'bg-lime-500/20' : 'bg-neutral-700'
                        }`}>
                        <span className={`text-sm font-semibold ${reply.authorType === 'admin' ? 'text-lime-500' : 'text-white'
                          }`}>
                          {reply.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className={`font-medium ${reply.authorType === 'admin' ? 'text-lime-500' : 'text-white'
                          }`}>
                          {reply.author}
                        </span>
                        <p className="text-xs text-neutral-400">
                          {reply.authorType === 'admin' ? 'Support Team' : 'Customer'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-neutral-400">
                      {new Date(reply.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-neutral-300 ml-10 whitespace-pre-wrap">{reply.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Ticket Reply Modal Component
const TicketReplyModal = ({ ticket, onClose, onSuccess }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(`/support-tickets/${ticket._id}`, {
        status: newStatus,
        adminReply: replyMessage
      });

      if (response.data.success) {
        toast.success('Reply sent successfully');
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-lime-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Reply to Ticket #{ticket._id.slice(-6)}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <h3 className="text-lg font-medium text-white mb-2">{ticket.subject}</h3>
            <p className="text-neutral-300 text-sm mb-3 line-clamp-3">{ticket.description}</p>
            <div className="flex items-center flex-wrap gap-3 text-sm text-neutral-400">
              <span className="flex items-center">
                <span className="text-neutral-500 mr-1">Customer:</span>
                <span className="text-white">{ticket.customerName || ticket.user?.name || 'N/A'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="text-neutral-500 mr-1">Category:</span>
                <span className="text-white capitalize">{ticket.category}</span>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="text-neutral-500 mr-1">Priority:</span>
                <span className="text-orange-400 uppercase">{ticket.priority}</span>
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-300 mb-2">
              Update Status
            </label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Reply */}
          <div>
            <label htmlFor="reply" className="block text-sm font-medium text-neutral-300 mb-2">
              Your Reply *
            </label>
            <textarea
              id="reply"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors resize-none"
              placeholder="Type your reply to the customer..."
              required
            />
            <p className="mt-2 text-xs text-neutral-400">
              Your reply will be visible to the customer
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !replyMessage.trim()}
              className="flex items-center px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-900 border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Reply className="w-5 h-5 mr-2" />
                  Send Reply & Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSupportTickets;