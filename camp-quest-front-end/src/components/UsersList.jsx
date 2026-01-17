// pages/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  X,
  Check,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // DIAGNOSTIC LOGGING
      const token = localStorage.getItem('token');
      console.log('=== USERS FETCH DEBUG ===');
      console.log('BASE_URL:', axios.defaults.baseURL);
      console.log('TOKEN_PRESENT:', !!token);
      console.log('TOKEN_VALUE:', token ? token.substring(0, 20) + '...' : 'NONE');
      console.log('AUTH_HEADER:', axios.defaults.headers.common['Authorization']);
      console.log('REQUEST_URL:', '/users');
      console.log('REQUEST_PARAMS:', {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        role: roleFilter
      });

      const response = await axios.get('/users', {
        params: {
          page: currentPage,
          limit: 12,
          search: searchTerm,
          role: roleFilter
        }
      });

      console.log('USERS_RESPONSE_STATUS:', response.status);
      console.log('USERS_RESPONSE_DATA:', response.data);

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
      }
    } catch (error) {
      console.error('=== USERS FETCH ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/users/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const response = await axios.put(`/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        toast.success('User role updated successfully');
        fetchUsers();
        fetchUserStats();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`/users/${userId}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        fetchUserStats();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openUserModal = async (userId) => {
    try {
      const response = await axios.get(`/users/${userId}`);
      if (response.data.success) {
        setSelectedUser(response.data.user);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      toast.loading('Generating PDF...', { id: 'pdf-export' });

      // Fetch all users for export (without pagination)
      let allUsers = [];
      try {
        const response = await axios.get('/users', {
          params: {
            limit: 10000,
            search: searchTerm,
            role: roleFilter
          }
        });
        allUsers = response.data.users || [];
      } catch (error) {
        console.error('Error fetching all users:', error);
        allUsers = users; // Fallback to current page users
      }

      if (allUsers.length === 0) {
        toast.error('No users to export', { id: 'pdf-export' });
        setExportLoading(false);
        return;
      }

      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors
      const primaryColor = [132, 204, 22]; // Lime-500
      const darkColor = [23, 23, 23]; // Neutral-900
      const grayColor = [115, 115, 115]; // Neutral-500
      const lightGray = [245, 245, 245];

      // ============ HEADER SECTION ============
      // Header background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Company logo/title
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('CampQuest', 15, 18);

      // Report title
      doc.setFontSize(16);
      doc.text('User Management Report', 15, 30);

      // Generation date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${dateStr}`, 15, 38);

      let yPos = 55;

      // ============ STATISTICS SECTION ============
      if (stats) {
        // Stats box background
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.roundedRect(10, yPos, pageWidth - 20, 50, 3, 3, 'F');

        // Stats title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('User Statistics Overview', 15, yPos + 10);

        // Stats grid
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const statsData = [
          { label: 'Total Users:', value: stats.totalUsers?.toString() || '0', x: 15, y: yPos + 20 },
          { label: 'Admin Users:', value: stats.adminUsers?.toString() || '0', x: 15, y: yPos + 28 },
          { label: 'Regular Users:', value: stats.regularUsers?.toString() || '0', x: 110, y: yPos + 20 },
          { label: 'Recent (30 days):', value: stats.recentUsers?.toString() || '0', x: 110, y: yPos + 28 }
        ];

        statsData.forEach((stat) => {
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.text(stat.label, stat.x, stat.y);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
          doc.text(stat.value, stat.x + 40, stat.y);

          doc.setFont('helvetica', 'normal');
        });


        yPos += 60;
      }

      // ============ FILTER INFORMATION ============
      if (searchTerm || roleFilter !== 'all') {
        doc.setFontSize(9);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont('helvetica', 'italic');
        let filterText = 'Applied Filters: ';
        if (searchTerm) filterText += `Search: "${searchTerm}" `;
        if (roleFilter !== 'all') filterText += `• Role: ${roleFilter.toUpperCase()}`;
        doc.text(filterText, 15, yPos);
        yPos += 10;
      }

      // ============ USERS TABLE ============
      // Prepare table data
      const tableData = allUsers.map((user, index) => [
        (index + 1).toString(),
        user.name || 'N/A',
        user.email || 'N/A',
        user.phone || 'N/A',
        user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User',
        formatDate(user.createdAt || new Date())
      ]);

      // Add table using autoTable
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Name', 'Email', 'Phone', 'Role', 'Joined Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: darkColor,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 38 },
          2: { cellWidth: 52 },
          3: { cellWidth: 32 },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 32, halign: 'center' }
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          // ============ FOOTER ON EACH PAGE ============
          const footerY = pageHeight - 15;

          // Footer line
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(10, footerY - 5, pageWidth - 10, footerY - 5);

          // Footer text
          doc.setFontSize(8);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.setFont('helvetica', 'normal');

          // Left: Company name
          doc.text('CampQuest - User Management System', 15, footerY);

          // Center: Page number
          const pageNum = doc.internal.getNumberOfPages();
          const pageStr = `Page ${data.pageNumber}${pageNum > 1 ? ' of ' + pageNum : ''}`;
          doc.text(pageStr, pageWidth / 2, footerY, { align: 'center' });

          // Right: Total users
          doc.text(`Total: ${allUsers.length} users`, pageWidth - 15, footerY, { align: 'right' });
        },
        didDrawCell: (data) => {
          // Highlight admin users with different color
          if (data.section === 'body' && data.column.index === 4) {
            if (data.cell.raw === 'Admin') {
              doc.setFillColor(134, 239, 172); // Green for admin
            }
          }
        }
      });

      // ============ SUMMARY SECTION ============
      const finalY = doc.lastAutoTable.finalY + 15;

      if (finalY + 35 < pageHeight - 20) {
        // Summary box
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(10, finalY, pageWidth - 20, 30, 3, 3, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Report Summary', 15, finalY + 10);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const adminCount = allUsers.filter(u => u.role === 'admin').length;
        const userCount = allUsers.filter(u => u.role === 'user' || !u.role).length;

        doc.text(`• Total users in this report: ${allUsers.length}`, 15, finalY + 18);
        doc.text(`• Admin users: ${adminCount} (${((adminCount / allUsers.length) * 100).toFixed(1)}%)`, 15, finalY + 24);
        doc.text(`• Regular users: ${userCount} (${((userCount / allUsers.length) * 100).toFixed(1)}%)`, 100, finalY + 24);
      }

      // ============ SAVE PDF ============
      const timestamp = now.toISOString().split('T')[0];
      const filename = `CampQuest_Users_Report_${timestamp}.pdf`;

      doc.save(filename);

      toast.success(`PDF exported successfully! (${allUsers.length} users)`, { id: 'pdf-export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.', { id: 'pdf-export' });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-neutral-400">Manage all registered users</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            disabled={exportLoading || loading || users.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-600"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 transition-colors font-medium disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-blue-400" />} />
          <StatsCard title="Admin Users" value={stats.adminUsers} icon={<Shield className="w-6 h-6 text-green-400" />} />
          <StatsCard title="Regular Users" value={stats.regularUsers} icon={<User className="w-6 h-6 text-purple-400" />} />
          <StatsCard title="Recent (30 days)" value={stats.recentUsers} icon={<Calendar className="w-6 h-6 text-orange-400" />} />
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="flex space-x-2">
            {['all', 'user', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleFilter(role)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors capitalize ${roleFilter === role
                  ? 'bg-lime-500 text-neutral-900'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
              >
                {role === 'all' ? 'All Users' : `${role}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            Showing {users.length} of {totalUsers} users
            {searchTerm && ` matching "${searchTerm}"`}
            {roleFilter !== 'all' && ` with role "${roleFilter}"`}
          </div>

          {users.length > 0 && (
            <button
              onClick={exportToPDF}
              disabled={exportLoading}
              className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Quick export</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">All Users</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">
                {searchTerm || roleFilter !== 'all' ? 'No users found matching your criteria' : 'No users found'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onViewDetails={() => openUserModal(user._id)}
                    onRoleUpdate={handleRoleUpdate}
                    onDelete={() => setShowDeleteConfirm(user)}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (page > totalPages) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                          ? 'bg-lime-500 text-neutral-900'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onRoleUpdate={handleRoleUpdate}
          formatDate={formatDate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          user={showDeleteConfirm}
          onConfirm={() => handleDeleteUser(showDeleteConfirm._id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon }) => (
  <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700 hover:border-lime-500 transition-colors">
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <p className="text-sm text-neutral-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value || 0}</h3>
      </div>
      <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

// User Card Component
const UserCard = ({ user, onViewDetails, onRoleUpdate, onDelete, formatDate }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="text-neutral-900 font-semibold text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{user.name || 'Unknown'}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin'
                ? 'bg-green-400/20 text-green-400'
                : 'bg-blue-400/20 text-blue-400'
                }`}>
                {user.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 top-10 bg-neutral-700 rounded-lg border border-neutral-600 py-2 z-20 min-w-40 shadow-xl">
                <button
                  onClick={() => {
                    onViewDetails();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-neutral-300 hover:bg-neutral-600 flex items-center space-x-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-neutral-300 hover:bg-neutral-600 flex items-center space-x-2 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>{user.role === 'admin' ? 'Make User' : 'Make Admin'}</span>
                </button>
                <div className="border-t border-neutral-600 my-1"></div>
                <button
                  onClick={() => {
                    onDelete();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-neutral-600 flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-neutral-400">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{user.email || 'No email'}</span>
        </div>

        {user.phone && (
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{user.phone}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-neutral-400">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Joined {formatDate(user.createdAt || new Date())}</span>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="w-full mt-4 px-4 py-2 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors font-medium"
      >
        View Full Profile
      </button>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onRoleUpdate, formatDate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-lime-500">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
          <h2 className="text-xl font-bold text-white">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="text-neutral-900 font-semibold text-2xl">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white truncate">{user.name || 'Unknown User'}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-sm px-3 py-1 rounded-full ${user.role === 'admin'
                    ? 'bg-green-400/20 text-green-400'
                    : 'bg-blue-400/20 text-blue-400'
                    }`}>
                    {user.role || 'user'}
                  </span>
                  <button
                    onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                    className="text-sm px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full hover:bg-neutral-600 transition-colors"
                  >
                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    <span className="text-neutral-300 break-all">{user.email || 'No email'}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                      <span className="text-neutral-300">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-300">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Account Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-neutral-300">Joined {formatDate(user.createdAt || new Date())}</p>
                      <p className="text-sm text-neutral-500 mt-1">Last updated {formatDate(user.updatedAt || new Date())}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">About</h4>
                <p className="text-neutral-300 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ user, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-800 rounded-xl max-w-md w-full p-6 border border-red-500">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Delete User</h3>
        </div>

        <p className="text-neutral-300 mb-6">
          Are you sure you want to delete <strong className="text-white">{user.name || 'this user'}</strong>? This action cannot be undone and will permanently remove all user data.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;