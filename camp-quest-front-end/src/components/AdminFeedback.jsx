import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, Search, TrendingUp, BarChart, Download, FileText } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  const [filters, setFilters] = useState({
    category: 'all',
    rating: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [filters]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.rating !== 'all') {
        params.append('rating', filters.rating);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      // Diagnostic logging
      const token = localStorage.getItem('token');
      console.log('=== ADMIN FEEDBACK FETCH DEBUG ===');
      console.log('BASE_URL:', axios.defaults.baseURL);
      console.log('TOKEN_PRESENT:', !!token);
      console.log('AUTH_HEADER:', axios.defaults.headers.common['Authorization']);
      console.log('REQUEST_URL:', `/feedback?${params.toString()}`);

      const response = await axios.get(`/feedback?${params.toString()}`);

      console.log('RESPONSE_STATUS:', response.status);
      console.log('RESPONSE_DATA:', response.data);

      if (response.data.success) {
        setFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('=== ADMIN FEEDBACK FETCH ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/feedback/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`/feedback/admin/${feedbackId}`);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        fetchFeedback();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const exportToPDF = async () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Add modern header with gradient effect (simulated with colors)
      doc.setFillColor(139, 195, 74); // Lime color
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Add title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('Feedback Report', pageWidth / 2, 20, { align: 'center' });

      // Add subtitle with filters
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const filterText = `Category: ${filters.category === 'all' ? 'All' : filters.category} | Rating: ${filters.rating === 'all' ? 'All' : filters.rating + ' Stars'}`;
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
        doc.roundedRect(14, yPosition, pageWidth - 28, 35, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(51, 51, 51);
        doc.text('Summary Statistics', 20, yPosition + 10);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(85, 85, 85);

        const col1X = 20;
        const col2X = pageWidth / 2;

        doc.text(`Total Feedback: ${stats.totalFeedback}`, col1X, yPosition + 20);
        doc.text(`Average Rating: ${stats.overallRating.toFixed(2)}/5`, col2X, yPosition + 20);

        const positiveReviews = stats.ratingBreakdown?.filter(r => r._id >= 4).reduce((sum, r) => sum + r.count, 0) || 0;
        doc.text(`Positive Reviews (4-5): ${positiveReviews}`, col1X, yPosition + 28);
        doc.text(`Categories: ${stats.categoryBreakdown?.length || 0}`, col2X, yPosition + 28);

        yPosition += 45;
      }

      // Prepare table data
      const tableData = feedback.map((item, index) => [
        index + 1,
        item.subject.substring(0, 30) + (item.subject.length > 30 ? '...' : ''),
        item.category.toUpperCase(),
        '*'.repeat(item.rating),
        item.isAnonymous ? 'Anonymous' : (item.user?.name || 'N/A'),
        new Date(item.createdAt).toLocaleDateString(),
        item.message.substring(0, 50) + (item.message.length > 50 ? '...' : '')
      ]);

      // Use autoTable as a function (not as doc.autoTable)
      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Subject', 'Category', 'Rating', 'User', 'Date', 'Message']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [139, 195, 74],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 51, 51]
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 25 },
          5: { cellWidth: 25, halign: 'center' },
          6: { cellWidth: 'auto' }
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

      // Add detailed feedback section on new page
      if (feedback.length > 0) {
        doc.addPage();
        yPosition = 20;

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(51, 51, 51);
        doc.text('Detailed Feedback', 20, yPosition);

        yPosition += 10;

        feedback.forEach((item, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
          }

          // Feedback box
          doc.setFillColor(245, 248, 250);
          doc.roundedRect(14, yPosition, pageWidth - 28, 50, 2, 2, 'F');

          // Feedback number and subject
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(51, 51, 51);
          doc.text(`${index + 1}. ${item.subject}`, 20, yPosition + 8);

          // Category and Rating
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(85, 85, 85);
          doc.text(`Category: ${item.category.toUpperCase()}`, 20, yPosition + 16);
          doc.text(`Rating: ${'*'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)} (${item.rating}/5)`, 80, yPosition + 16);

          // User and Date
          const userName = item.isAnonymous ? 'Anonymous' : (item.user?.name || 'N/A');
          doc.text(`By: ${userName}`, 20, yPosition + 23);
          doc.text(`Date: ${new Date(item.createdAt).toLocaleDateString()}`, 80, yPosition + 23);

          // Message
          doc.setFontSize(8);
          doc.setTextColor(68, 68, 68);
          const splitMessage = doc.splitTextToSize(item.message, pageWidth - 48);
          doc.text(splitMessage.slice(0, 3), 20, yPosition + 31);

          yPosition += 58;
        });
      }

      // Save the PDF
      const fileName = `feedback-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setExportingPDF(false);
    }
  };

  const getRatingStars = (rating) => {
    return '*'.repeat(rating) + ''.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Prepare chart data
  const ratingChartData = stats?.ratingBreakdown?.map(item => ({
    name: `${item._id} Star${item._id > 1 ? 's' : ''}`,
    value: item.count,
    rating: item._id
  })) || [];

  const categoryChartData = stats?.categoryBreakdown?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
    rating: parseFloat(item.averageRating.toFixed(1))
  })) || [];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
  const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Feedback</h1>
          <p className="text-neutral-400">Monitor and analyze customer feedback</p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={exportingPDF || feedback.length === 0}
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
            title="Total Feedback"
            value={stats.totalFeedback}
            icon={<MessageSquare className="w-6 h-6 text-blue-400" />}
          />
          <StatsCard
            title="Average Rating"
            value={`${stats.overallRating.toFixed(1)}/5`}
            icon={<Star className="w-6 h-6 text-yellow-400" />}
          />
          <StatsCard
            title="Positive Reviews"
            value={stats.ratingBreakdown?.filter(r => r._id >= 4).reduce((sum, r) => sum + r.count, 0) || 0}
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
          />
          <StatsCard
            title="Categories"
            value={stats.categoryBreakdown?.length || 0}
            icon={<BarChart className="w-6 h-6 text-purple-400" />}
          />
        </div>
      )}

      {/* Charts Section */}
      {stats && (ratingChartData.length > 0 || categoryChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution Pie Chart */}
          {ratingChartData.length > 0 && (
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ratingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1]} />
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
                    formatter={(value, entry) => <span style={{ color: '#d4d4d4' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Breakdown Bar Chart */}
          {categoryChartData.length > 0 && (
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Feedback by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis
                    dataKey="name"
                    stroke="#d4d4d4"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                  />
                  <YAxis stroke="#d4d4d4" tick={{ fill: '#d4d4d4' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#262626',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Category Breakdown Cards */}
      {stats && stats.categoryBreakdown && (
        <div className="bg-neutral-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Category Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.categoryBreakdown.map((cat, index) => (
              <div key={index} className="bg-neutral-800 rounded-lg p-4 border border-neutral-700 hover:border-lime-500 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium capitalize">{cat._id}</h4>
                    <p className="text-sm text-neutral-400">{cat.count} feedback</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getRatingColor(cat.averageRating)}`}>
                      {cat.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-neutral-400">avg rating</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-lime-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(cat.averageRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-lime-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filter Feedback</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="all">All Categories</option>
            <option value="service">Service Quality</option>
            <option value="equipment">Equipment Quality</option>
            <option value="website">Website Experience</option>
            <option value="staff">Staff Behavior</option>
            <option value="pricing">Pricing</option>
            <option value="suggestion">Suggestion</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
        </div>
        {(filters.category !== 'all' || filters.rating !== 'all' || filters.search) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-400">
              Showing {feedback.length} filtered result{feedback.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setFilters({ category: 'all', rating: 'all', search: '', page: 1, limit: 10 })}
              className="text-sm text-lime-500 hover:text-lime-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-700 border-t-lime-500"></div>
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900 rounded-lg">
            <MessageSquare className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">No feedback found</p>
            {(filters.category !== 'all' || filters.rating !== 'all' || filters.search) && (
              <p className="text-neutral-500 text-sm mt-2">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          feedback.map((item) => (
            <FeedbackCard
              key={item._id}
              feedback={item}
              onDelete={() => handleDeleteFeedback(item._id)}
              getRatingStars={getRatingStars}
              getRatingColor={getRatingColor}
            />
          ))
        )}
      </div>
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

// Feedback Card Component
const FeedbackCard = ({ feedback, onDelete, getRatingStars, getRatingColor }) => {
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-lime-500 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10">
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
              <span className={`text-lg ${getRatingColor(feedback.rating)}`}>
                {getRatingStars(feedback.rating)}
              </span>
              <span className="ml-2 text-sm text-neutral-400">
                ({feedback.rating}/5)
              </span>
            </div>
            <span className="text-sm text-neutral-400">
              {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {!feedback.isAnonymous && feedback.user && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center">
                <span className="text-lime-500 font-semibold text-sm">
                  {feedback.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-300 font-medium">{feedback.user.name}</p>
                <p className="text-xs text-neutral-500">{feedback.user.email}</p>
              </div>
            </div>
          )}

          {feedback.isAnonymous && (
            <p className="text-sm text-neutral-400 mb-2 italic">
              📝 Anonymous Feedback
            </p>
          )}
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
          title="Delete Feedback"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div>
        <h5 className="font-medium text-neutral-300 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-lime-500" />
          Message:
        </h5>
        <p className="text-neutral-300 bg-neutral-800/50 p-4 rounded-lg leading-relaxed border border-neutral-700">
          {feedback.message}
        </p>
      </div>
    </div>
  );
};

export default AdminFeedback;
