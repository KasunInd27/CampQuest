import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import FeedbackForm from './FeedbackForm';

const FeedbackList = ({ isAdmin = false }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    rating: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [filters, currentPage]);

  const fetchFeedback = async () => {
    try {
      const endpoint = isAdmin ? '/feedback' : '/feedback/my-feedback';
      const params = new URLSearchParams({
        page: currentPage,
        ...filters
      });

      // DIAGNOSTIC LOGGING
      const token = localStorage.getItem('token');
      console.log('=== FEEDBACK FETCH DEBUG ===');
      console.log('BASE_URL:', axios.defaults.baseURL);
      console.log('TOKEN_PRESENT:', !!token);
      console.log('AUTH_HEADER:', axios.defaults.headers.common['Authorization']);
      console.log('IS_ADMIN:', isAdmin);
      console.log('REQUEST_URL:', `${endpoint}?${params}`);

      const response = await axios.get(`${endpoint}?${params}`);

      console.log('FEEDBACK_RESPONSE_STATUS:', response.status);
      console.log('FEEDBACK_RESPONSE_DATA:', response.data);

      if (response.data.success) {
        setFeedback(response.data.feedback);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('=== FEEDBACK FETCH ERROR ===');
      console.error('Failed to fetch feedback:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const endpoint = isAdmin ? `/feedback/admin/${feedbackId}` : `/feedback/${feedbackId}`;
      const response = await axios.delete(endpoint);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        fetchFeedback();
      }
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const handleEditClick = (feedbackItem) => {
    setEditingFeedback(feedbackItem);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingFeedback(null);
    fetchFeedback();
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showEditForm && !isAdmin) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setShowEditForm(false)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to My Feedback
          </button>
        </div>
        <FeedbackForm
          existingFeedback={editingFeedback}
          onSuccess={handleEditSuccess}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isAdmin ? 'All Feedback' : 'My Feedback'}
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          <option value="service">Service Quality</option>
          <option value="equipment">Equipment Quality</option>
          <option value="website">Website Experience</option>
          <option value="staff">Staff Behavior</option>
          <option value="pricing">Pricing</option>
          <option value="suggestion">Suggestion</option>
        </select>

        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No feedback found.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <FeedbackCard
              key={item._id}
              feedback={item}
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={deleteFeedback}
              getRatingStars={getRatingStars}
              getRatingColor={getRatingColor}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md ${page === currentPage
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

const FeedbackCard = ({ feedback, isAdmin, onEdit, onDelete, getRatingStars, getRatingColor }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{feedback.subject}</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {feedback.category.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center">
              <span className={`text-lg ${getRatingColor(feedback.rating)}`}>
                {getRatingStars(feedback.rating)}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                ({feedback.rating}/5)
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isAdmin && !feedback.isAnonymous && (
            <p className="text-sm text-gray-600 mb-2">
              By: {feedback.user?.name} ({feedback.user?.email})
            </p>
          )}

          {isAdmin && feedback.isAnonymous && (
            <p className="text-sm text-gray-600 mb-2">
              Anonymous Feedback
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {!isAdmin && (
            <button
              onClick={() => onEdit(feedback)}
              className="text-indigo-600 hover:text-indigo-800"
              title="Edit Feedback"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onDelete(feedback._id)}
            className="text-red-600 hover:text-red-800"
            title="Delete Feedback"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-gray-900 mb-2">Message:</h5>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{feedback.message}</p>
      </div>
    </div>
  );
};

export default FeedbackList;