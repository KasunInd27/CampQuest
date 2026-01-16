import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf'; // Note: destructured import
import autoTable from 'jspdf-autotable'; // This is the correct import
const SupportTicketList = ({ isAdmin = false }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [filters, currentPage]);

  const fetchTickets = async () => {
    try {
      const endpoint = isAdmin ? '/support-tickets' : '/support-tickets/my-tickets';
      const params = new URLSearchParams({
        page: currentPage,
        ...filters
      });

      // DIAGNOSTIC LOGGING
      const token = localStorage.getItem('token');
      console.log('=== SUPPORT TICKETS FETCH DEBUG ===');
      console.log('BASE_URL:', axios.defaults.baseURL);
      console.log('TOKEN_PRESENT:', !!token);
      console.log('AUTH_HEADER:', axios.defaults.headers.common['Authorization']);
      console.log('IS_ADMIN:', isAdmin);
      console.log('REQUEST_URL:', `${endpoint}?${params}`);

      const response = await axios.get(`${endpoint}?${params}`);

      console.log('TICKETS_RESPONSE_STATUS:', response.status);
      console.log('TICKETS_RESPONSE_DATA:', response.data);

      if (response.data.success) {
        setTickets(response.data.tickets);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('=== SUPPORT TICKETS FETCH ERROR ===');
      console.error('Failed to fetch tickets:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status, adminReply = '') => {
    try {
      const response = await axios.put(`/support-tickets/${ticketId}`, {
        status,
        adminReply
      });

      if (response.data.success) {
        toast.success('Ticket updated successfully');
        fetchTickets();
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await axios.delete(`/support-tickets/${ticketId}`);
      if (response.data.success) {
        toast.success('Ticket deleted successfully');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const downloadPDF = (ticket) => {
    const doc = new jsPDF();

    // Set colors
    const primaryColor = [34, 197, 94]; // green-500
    const darkColor = [51, 65, 85]; // slate-700
    const lightColor = [241, 245, 249]; // slate-100

    // Add header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Support Ticket', 20, 25);

    // Reset text color
    doc.setTextColor(...darkColor);

    // Ticket ID box
    doc.setFillColor(...lightColor);
    doc.roundedRect(20, 50, 170, 15, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Ticket ID: #${ticket._id}`, 25, 60);

    // Details section
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);

    const details = [
      { label: 'Subject:', value: ticket.subject },
      { label: 'Category:', value: ticket.category },
      { label: 'Priority:', value: ticket.priority },
      { label: 'Status:', value: ticket.status },
      { label: 'Created:', value: new Date(ticket.createdAt).toLocaleDateString() }
    ];

    let yPos = 80;
    details.forEach(detail => {
      doc.setFont(undefined, 'bold');
      doc.text(detail.label, 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(detail.value, 60, yPos);
      yPos += 10;
    });

    // Description section
    yPos += 10;
    doc.setFillColor(...lightColor);
    doc.roundedRect(20, yPos - 5, 170, 8, 2, 2, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Description', 25, yPos);

    yPos += 15;
    doc.setFont(undefined, 'normal');
    const splitDescription = doc.splitTextToSize(ticket.description, 160);
    doc.text(splitDescription, 25, yPos);

    // Admin reply if exists
    if (ticket.adminReply) {
      yPos += (splitDescription.length * 6) + 15;
      doc.setFillColor(...lightColor);
      doc.roundedRect(20, yPos - 5, 170, 8, 2, 2, 'F');
      doc.setFont(undefined, 'bold');
      doc.text('Admin Reply', 25, yPos);

      yPos += 15;
      doc.setFont(undefined, 'normal');
      const splitReply = doc.splitTextToSize(ticket.adminReply, 160);
      doc.text(splitReply, 25, yPos);
    }

    // Footer
    doc.setFillColor(...primaryColor);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });

    doc.save(`ticket-${ticket._id}.pdf`);
  };
  const downloadAllPDF = () => {
    console.log(tickets);
    const doc = new jsPDF();

    // Set colors
    const primaryColor = [34, 197, 94]; // green-500
    const darkColor = [51, 65, 85]; // slate-700
    const lightColor = [241, 245, 249]; // slate-100
    const mediumColor = [226, 232, 240]; // slate-200

    // Add header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Support Tickets Report', 20, 25);

    // Total tickets count
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Tickets: ${tickets.length}`, 20, 35);

    // Info box
    doc.setFillColor(...lightColor);
    doc.roundedRect(20, 50, 170, 20, 3, 3, 'F');
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 25, 60);

    // Status summary
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    let statusText = 'Status: ';
    Object.entries(statusCounts).forEach(([status, count], index) => {
      statusText += `${status} (${count})${index < Object.entries(statusCounts).length - 1 ? ', ' : ''}`;
    });
    doc.text(statusText, 25, 67);

    // Start rendering tickets as cards
    let yPos = 85;
    let pageNumber = 1;
    const pageHeight = 280; // Leave space for footer

    if (tickets.length === 0) {
      doc.setFontSize(14);
      doc.text('No tickets to display', 105, 120, { align: 'center' });
    } else {
      tickets.forEach((ticket, index) => {
        // Check if we need a new page
        if (yPos + 60 > pageHeight) {
          // Add footer to current page
          doc.setFillColor(...primaryColor);
          doc.rect(0, 280, 210, 17, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text(`Page ${pageNumber} | Total Tickets: ${tickets.length}`, 105, 290, { align: 'center' });

          // Add new page
          doc.addPage();
          pageNumber++;
          yPos = 20;
        }

        // Card background
        doc.setFillColor(...mediumColor);
        doc.roundedRect(20, yPos, 170, 50, 3, 3, 'F');

        // Card content
        doc.setTextColor(...darkColor);

        // Ticket ID and Status badge
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`#${ticket._id.slice(-6)}`, 25, yPos + 10);

        // Status badge (simplified)
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const statusColors = {
          open: primaryColor,
          'in-progress': [251, 191, 36], // yellow
          resolved: primaryColor,
          closed: darkColor
        };
        const statusColor = statusColors[ticket.status] || darkColor;
        doc.setTextColor(...statusColor);
        doc.text(ticket.status.toUpperCase(), 170, yPos + 10, { align: 'right' });

        // Reset color for other text
        doc.setTextColor(...darkColor);

        // Subject
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        const truncatedSubject = ticket.subject && ticket.subject.length > 50
          ? ticket.subject.substring(0, 50) + '...'
          : ticket.subject || 'No subject';
        doc.text(truncatedSubject, 25, yPos + 20);

        // Details row
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Category: ${ticket.category || 'N/A'}`, 25, yPos + 30);
        doc.text(`Priority: ${ticket.priority || 'N/A'}`, 80, yPos + 30);
        doc.text(`Created: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}`, 130, yPos + 30);

        // Description preview
        doc.setFontSize(9);
        const descriptionPreview = ticket.description && ticket.description.length > 80
          ? ticket.description.substring(0, 80) + '...'
          : ticket.description || 'No description';
        const splitDesc = doc.splitTextToSize(descriptionPreview, 160);
        doc.text(splitDesc[0] || '', 25, yPos + 40);

        // Admin reply indicator
        if (ticket.adminReply) {
          doc.setTextColor(...primaryColor);
          doc.setFont(undefined, 'italic');
          doc.text('✓ Has admin reply', 25, yPos + 47);
        }

        yPos += 60; // Space between cards
      });
    }

    // Add footer to last page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(...primaryColor);
      doc.rect(0, 280, 210, 17, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages} | Total Tickets: ${tickets.length} | Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
    }

    // Save the PDF
    try {
      doc.save(`support-tickets-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-slate-100 text-slate-700 border-slate-200',
      'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      resolved: 'bg-green-50 text-green-700 border-green-200',
      closed: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-50 text-green-700 border-green-200',
      medium: 'bg-slate-100 text-slate-700 border-slate-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      urgent: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {isAdmin ? 'All Support Tickets' : 'My Support Tickets'}
          </h2>
          <p className="text-slate-600 mt-1">Manage and track support requests</p>
        </div>
        {!isAdmin && tickets.length > 0 && (
          <button
            onClick={downloadAllPDF}
            className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 font-medium shadow-sm"
          >
            Download All PDF
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-slate-700"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="equipment">Equipment</option>
          <option value="general">General</option>
          <option value="complaint">Complaint</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-slate-700"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-lg">No support tickets found</p>
            <p className="text-slate-400 text-sm mt-1">Your tickets will appear here</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              isAdmin={isAdmin}
              onStatusUpdate={updateTicketStatus}
              onDelete={deleteTicket}
              onDownloadPDF={downloadPDF}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${page === currentPage
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TicketCard = ({ ticket, isAdmin, onStatusUpdate, onDelete, onDownloadPDF }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState(ticket.status);

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-slate-100 text-slate-700 border border-slate-200',
      'in-progress': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      resolved: 'bg-green-50 text-green-700 border border-green-200',
      closed: 'bg-slate-50 text-slate-600 border border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-50 text-green-700 border border-green-200',
      medium: 'bg-slate-100 text-slate-700 border border-slate-200',
      high: 'bg-orange-50 text-orange-700 border border-orange-200',
      urgent: 'bg-red-50 text-red-700 border border-red-200'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onStatusUpdate(ticket._id, newStatus, replyText);
      setShowReplyForm(false);
      setReplyText('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <h3 className="text-lg font-bold text-slate-800">#{ticket._id.slice(-6)}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </span>
          </div>
          <h4 className="text-xl font-semibold text-slate-800 mb-3">{ticket.subject}</h4>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {ticket.category}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
          {isAdmin && (
            <div className="mt-2 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {ticket.user?.name} ({ticket.user?.email})
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onDownloadPDF(ticket)}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
            title="Download PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(ticket._id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Ticket"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h5 className="font-semibold text-slate-700 mb-2">Description</h5>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-slate-600 leading-relaxed">{ticket.description}</p>
        </div>
      </div>

      {ticket.adminReply && (
        <div className="mb-6">
          <h5 className="font-semibold text-slate-700 mb-2">Admin Reply</h5>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-slate-700 leading-relaxed mb-3">{ticket.adminReply}</p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">{ticket.repliedBy?.name}</span> • {new Date(ticket.repliedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={() => onStatusUpdate(ticket._id, newStatus)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-200 font-medium"
          >
            Update Status
          </button>

          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 font-medium"
          >
            {showReplyForm ? 'Cancel Reply' : 'Add Reply'}
          </button>
        </div>
      )}

      {showReplyForm && (
        <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
            rows={4}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 resize-none"
          />
          <div className="flex flex-col sm:flex-row justify-end mt-4 gap-3">
            <button
              onClick={() => setShowReplyForm(false)}
              className="w-full sm:w-auto px-6 py-2 text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReplySubmit}
              className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketList;