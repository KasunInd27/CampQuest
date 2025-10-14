// pages/UserSupport.jsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, LifeBuoy, Edit, Trash2, Clock, CheckCircle, AlertCircle, Reply, Plus, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserSupport = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your support tickets and feedback');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-neutral-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-700 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Support & Feedback</h1>
            <p className="text-neutral-400">Manage your support tickets and feedback for {user.email}</p>
          </div>
          <button
            onClick={() => navigate('/support')}
            className="flex items-center px-6 py-3 bg-lime-400 text-neutral-700 rounded-lg hover:bg-lime-500 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-neutral-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'tickets'
                ? 'bg-lime-400 text-neutral-700'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-5 h-5 mr-2" />
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'feedback'
                ? 'bg-lime-400 text-neutral-700'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Feedback
          </button>
        </div>

        {/* Content */}
        {activeTab === 'tickets' ? <UserTicketsList user={user} /> : <UserFeedbackList user={user} />}
      </div>
    </div>
  );
};

// User Tickets List Component
const UserTicketsList = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      console.log('Fetching tickets for user:', user.email);
      const response = await axios.get(`/support-tickets/my-tickets`);
      console.log('Tickets response:', response.data);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    };
    return colors[status] || 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-700 border-t-lime-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <LifeBuoy className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg">No support tickets found</p>
          <p className="text-neutral-500">Create a new ticket to get help</p>
        </div>
      ) : (
        tickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            ticket={ticket}
            user={user}
            onReply={(ticket) => {
              setSelectedTicket(ticket);
              setShowReplyModal(true);
            }}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
        ))
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <ReplyModal
          ticket={selectedTicket}
          user={user}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedTicket(null);
          }}
          onSuccess={() => {
            fetchTickets();
            setShowReplyModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

// User Feedback List Component
const UserFeedbackList = ({ user }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      fetchFeedback();
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      console.log('Fetching feedback for user:', user.email);
      const response = await axios.get(`/feedback/my-feedback`);
      console.log('Feedback response:', response.data);
      if (response.data.success) {
        setFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const response = await axios.delete(`/feedback/${feedbackId}`);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-700 border-t-lime-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg">No feedback found</p>
          <p className="text-neutral-500">Share your experience with us</p>
        </div>
      ) : (
        feedback.map((item) => (
          <FeedbackCard
            key={item._id}
            feedback={item}
            onEdit={(feedback) => {
              setEditingFeedback(feedback);
              setShowEditModal(true);
            }}
            onDelete={deleteFeedback}
          />
        ))
      )}

      {/* Edit Modal */}
      {showEditModal && editingFeedback && (
        <EditFeedbackModal
          feedback={editingFeedback}
          onClose={() => {
            setShowEditModal(false);
            setEditingFeedback(null);
          }}
          onSuccess={() => {
            fetchFeedback();
            setShowEditModal(false);
            setEditingFeedback(null);
          }}
        />
      )}
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ ticket, user, onReply, getStatusColor, getPriorityColor }) => {
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">#{ticket._id.slice(-6)}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </span>
          </div>
          <h4 className="text-xl font-medium text-white mb-2">{ticket.subject}</h4>
          <div className="flex items-center space-x-4 text-sm text-neutral-400">
            <span>{ticket.category}</span>
            <span>•</span>
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <button
          onClick={() => onReply(ticket)}
          className="flex items-center px-4 py-2 bg-lime-400/10 text-lime-400 rounded-lg hover:bg-lime-400/20 transition-colors"
        >
          <Reply className="w-4 h-4 mr-2" />
          Reply {ticket.replies && ticket.replies.length > 0 && `(${ticket.replies.length})`}
        </button>
      </div>

      <div className="mb-4">
        <p className="text-neutral-300 bg-neutral-700/50 p-4 rounded-lg">{ticket.description}</p>
      </div>

      {ticket.replies && ticket.replies.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-neutral-400">Recent Replies:</h5>
          {ticket.replies.slice(-2).map((reply, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                reply.authorType === 'admin'
                  ? 'bg-lime-400/10 border border-lime-400/20'
                  : 'bg-neutral-700/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${
                  reply.authorType === 'admin' ? 'text-lime-400' : 'text-white'
                }`}>
                  {reply.author}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-neutral-300 text-sm">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Feedback Card Component
const FeedbackCard = ({ feedback, onEdit, onDelete }) => {
  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{feedback.subject}</h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {feedback.category.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center">
              <span className="text-lg text-lime-400">{getRatingStars(feedback.rating)}</span>
              <span className="ml-2 text-sm text-neutral-400">({feedback.rating}/5)</span>
            </div>
            <span className="text-sm text-neutral-400">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(feedback)}
            className="p-2 text-neutral-400 hover:text-lime-400 hover:bg-neutral-700 rounded-lg transition-colors"
            title="Edit Feedback"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(feedback._id)}
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-700 rounded-lg transition-colors"
            title="Delete Feedback"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <p className="text-neutral-300 bg-neutral-700/50 p-4 rounded-lg">{feedback.message}</p>
      </div>
    </div>
  );
};

// Reply Modal Component
const ReplyModal = ({ ticket, user, onClose, onSuccess }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/support-tickets/${ticket._id}/reply`, {
        message: replyMessage,
        authorType: 'user',
        authorName: user.name || ticket.customerName
      });
      
      if (response.data.success) {
        toast.success('Reply sent successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-800 border border-lime-400 rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Reply to Ticket #{ticket._id.slice(-6)}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Ticket Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">{ticket.subject}</h3>
            <p className="text-neutral-400 bg-neutral-700/50 p-3 rounded-lg">{ticket.description}</p>
          </div>

          {/* Existing Replies */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-400 mb-3">Conversation:</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ticket.replies.map((reply, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      reply.authorType === 'admin'
                        ? 'bg-lime-400/10 border border-lime-400/20'
                        : 'bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium ${
                        reply.authorType === 'admin' ? 'text-lime-400' : 'text-white'
                      }`}>
                        {reply.author}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reply" className="block text-sm font-medium text-neutral-300 mb-2">
                Your Reply
              </label>
              <textarea
                id="reply"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-400 transition-colors resize-none"
                placeholder="Type your reply here..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-neutral-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !replyMessage.trim()}
                className="flex items-center px-6 py-2 bg-lime-400 text-neutral-700 rounded-lg hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Reply className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Feedback Modal Component
const EditFeedbackModal = ({ feedback, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: feedback.subject,
    category: feedback.category,
    rating: feedback.rating,
    message: feedback.message,
    isAnonymous: feedback.isAnonymous
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const categories = [
    { value: 'service', label: 'Service Quality', icon: '🎯' },
    { value: 'equipment', label: 'Equipment Quality', icon: '⛺' },
    { value: 'website', label: 'Website Experience', icon: '💻' },
    { value: 'staff', label: 'Staff Behavior', icon: '👥' },
    { value: 'pricing', label: 'Pricing', icon: '💰' },
    { value: 'suggestion', label: 'Suggestion', icon: '💡' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.put(`/feedback/${feedback._id}`, formData);
      if (response.data.success) {
        toast.success('Feedback updated successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-800 border border-lime-400 rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Edit Feedback</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-400 transition-colors"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">Category *</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.category === cat.value
                      ? 'border-lime-400 bg-lime-400/10'
                      : 'border-neutral-600 bg-neutral-700/50 hover:border-neutral-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formData.category === cat.value}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-lg mr-3">{cat.icon}</span>
                  <span className={`font-medium ${
                    formData.category === cat.value ? 'text-lime-400' : 'text-white'
                  }`}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">Rating *</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-2 transition-all duration-200 hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || formData.rating)
                        ? 'text-lime-400 fill-current'
                        : 'text-neutral-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-400 transition-colors resize-none"
              required
            />
          </div>

          {/* Anonymous */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="h-5 w-5 text-lime-400 focus:ring-lime-400 border-neutral-500 rounded bg-neutral-700"
            />
            <label htmlFor="isAnonymous" className="text-sm text-neutral-300 cursor-pointer">
              Submit as anonymous feedback
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-neutral-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-lime-400 text-neutral-700 rounded-lg hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Updating...' : 'Update Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSupport;