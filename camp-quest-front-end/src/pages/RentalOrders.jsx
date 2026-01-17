// components/admin/RentalOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import axios, { BASE_URL } from '../lib/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RentalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        orderType: 'rental'
      });

      const { data } = await axios.get(`/orders/admin/orders?${params}`);
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching rental orders:', error);
      toast.error('Failed to fetch rental orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/orders/admin/orders/stats?orderType=rental');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const { data } = await axios.get(`/orders/admin/orders/${orderId}`);
      setSelectedOrder(data.order);
      setShowOrderModal(true);
    } catch (error) {
      toast.error('Failed to fetch order details');
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/orders/admin/orders/${orderId}`);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const handleBulkUpdate = async (updateData) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }

    try {
      await axios.put('/orders/admin/orders/bulk-update', {
        orderIds: selectedOrders,
        updateData
      });
      toast.success(`${selectedOrders.length} orders updated successfully`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update orders');
    }
  };

  const handleExportPDF = async () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    setExportLoading(true);
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header with gradient effect (simulated with rectangles)
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Accent line
      doc.setFillColor(132, 204, 22); // Lime color
      doc.rect(0, 42, pageWidth, 3, 'F');

      // Company name/logo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Rental Orders Report', 14, 20);

      // Report info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 14, 30);
      doc.text(`Total Orders: ${orders.length}`, 14, 37);

      // Filter info on the right
      doc.setTextColor(200, 200, 200);
      if (filters.status !== 'all') {
        doc.text(`Status: ${filters.status.toUpperCase()}`, pageWidth - 14, 30, { align: 'right' });
      }
      if (filters.priority !== 'all') {
        doc.text(`Priority: ${filters.priority.toUpperCase()}`, pageWidth - 14, 37, { align: 'right' });
      }

      // Stats summary boxes
      if (stats) {
        const boxY = 50;
        const boxWidth = (pageWidth - 20) / 4 - 3;
        const boxHeight = 18;
        const statsData = [
          { label: 'Total Orders', value: stats.totalOrders, color: [59, 130, 246] },
          { label: 'Pending', value: stats.pendingOrders, color: [234, 179, 8] },
          { label: 'Total Revenue', value: `LKR ${stats.totalRevenue.toFixed(2)}`, color: [34, 197, 94] },
          { label: 'Active Rentals', value: stats.statusBreakdown?.find(s => s._id === 'delivered')?.count || 0, color: [168, 85, 247] }
        ];

        statsData.forEach((stat, index) => {
          const x = 14 + (boxWidth + 3) * index;

          // Box background
          doc.setFillColor(30, 30, 30);
          doc.roundedRect(x, boxY, boxWidth, boxHeight, 2, 2, 'F');

          // Accent top border
          doc.setFillColor(...stat.color);
          doc.roundedRect(x, boxY, boxWidth, 2, 2, 2, 'F');

          // Text
          doc.setFontSize(8);
          doc.setTextColor(160, 160, 160);
          doc.text(stat.label, x + boxWidth / 2, boxY + 7, { align: 'center' });

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(String(stat.value), x + boxWidth / 2, boxY + 14, { align: 'center' });
        });
      }

      // Prepare table data
      const tableData = orders.map(order => {
        const rentalItem = order.items.find(item => item.rentalDays);
        const rentalPeriod = rentalItem
          ? `${rentalItem.rentalDays} days${rentalItem.rentalStartDate ? '\n' + new Date(rentalItem.rentalStartDate).toLocaleDateString() : ''}`
          : 'N/A';

        return [
          order.orderNumber,
          new Date(order.createdAt).toLocaleDateString(),
          order.customer.name,
          order.customer.email,
          rentalPeriod,
          order.status.toUpperCase(),
          order.priority.toUpperCase(),
          `LKR ${order.totalAmount.toFixed(2)}`
        ];
      });

      // Table using autoTable
      autoTable(doc, {
        head: [['Order #', 'Date', 'Customer', 'Email', 'Rental Period', 'Status', 'Priority', 'Amount']],
        body: tableData,
        startY: stats ? 73 : 50,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: [220, 220, 220],
          lineColor: [60, 60, 60],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          cellPadding: 5,
        },
        bodyStyles: {
          fillColor: [20, 20, 20],
        },
        alternateRowStyles: {
          fillColor: [25, 25, 25],
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 45 },
          4: { cellWidth: 30, fontSize: 7 },
          5: {
            cellWidth: 25,
            halign: 'center',
            fontStyle: 'bold'
          },
          6: {
            cellWidth: 22,
            halign: 'center',
            fontStyle: 'bold'
          },
          7: {
            cellWidth: 30,
            halign: 'right',
            fontStyle: 'bold',
            textColor: [132, 204, 22]
          },
        },
        didParseCell: function (data) {
          // Color code status column
          if (data.column.index === 5 && data.section === 'body') {
            const status = data.cell.raw.toLowerCase();
            if (status === 'pending') {
              data.cell.styles.textColor = [234, 179, 8];
            } else if (status === 'processing') {
              data.cell.styles.textColor = [59, 130, 246];
            } else if (status === 'shipped') {
              data.cell.styles.textColor = [168, 85, 247];
            } else if (status === 'delivered' || status === 'completed') {
              data.cell.styles.textColor = [34, 197, 94];
            } else if (status === 'cancelled') {
              data.cell.styles.textColor = [239, 68, 68];
            } else if (status === 'returned') {
              data.cell.styles.textColor = [156, 163, 175];
            }
          }

          // Color code priority column
          if (data.column.index === 6 && data.section === 'body') {
            const priority = data.cell.raw.toLowerCase();
            if (priority === 'low') {
              data.cell.styles.textColor = [34, 197, 94];
            } else if (priority === 'medium') {
              data.cell.styles.textColor = [234, 179, 8];
            } else if (priority === 'high') {
              data.cell.styles.textColor = [251, 146, 60];
            } else if (priority === 'urgent') {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        },
        didDrawPage: function (data) {
          // Footer
          const footerY = pageHeight - 15;

          doc.setFillColor(10, 10, 10);
          doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

          doc.setFillColor(132, 204, 22);
          doc.rect(0, pageHeight - 20, pageWidth, 2, 'F');

          doc.setFontSize(8);
          doc.setTextColor(160, 160, 160);
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth / 2,
            footerY,
            { align: 'center' }
          );

          doc.text(
            'Confidential - Rental Orders Report',
            14,
            footerY
          );

          doc.text(
            `© ${new Date().getFullYear()} Your Company`,
            pageWidth - 14,
            footerY,
            { align: 'right' }
          );
        },
        margin: { top: 10, right: 14, bottom: 25, left: 14 },
      });

      // Save the PDF
      const fileName = `rental-orders-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-400/10',
      processing: 'text-blue-400 bg-blue-400/10',
      shipped: 'text-purple-400 bg-purple-400/10',
      delivered: 'text-lime-500 bg-lime-500/10',
      completed: 'text-green-400 bg-green-400/10',
      cancelled: 'text-red-400 bg-red-400/10',
      returned: 'text-gray-400 bg-gray-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400 bg-green-400/10',
      medium: 'text-yellow-400 bg-yellow-400/10',
      high: 'text-orange-400 bg-orange-400/10',
      urgent: 'text-red-400 bg-red-400/10'
    };
    return colors[priority] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Rental Orders</h1>
          <p className="text-neutral-400">Manage and track rental orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exportLoading || orders.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Rental Orders"
            value={stats.totalOrders}
            icon={<Package className="w-6 h-6 text-blue-400" />}
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<Clock className="w-6 h-6 text-yellow-400" />}
          />
          <StatsCard
            title="Total Revenue"
            value={`${stats.totalRevenue.toFixed(2)}`}
            icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          />
          <StatsCard
            title="Active Rentals"
            value={stats.statusBreakdown?.find(s => s._id === 'delivered')?.count || 0}
            icon={<Calendar className="w-6 h-6 text-purple-400" />}
          />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-neutral-900 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-white">{selectedOrders.length} orders selected</span>
            <div className="flex items-center space-x-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkUpdate({ status: e.target.value });
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none"
              >
                <option value="">Change Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkUpdate({ priority: e.target.value });
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none"
              >
                <option value="">Change Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                onClick={() => setSelectedOrders([])}
                className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(orders.map(order => order._id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    className="rounded border-neutral-600 bg-neutral-700 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Rental Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-neutral-400">
                    No rental orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <OrderTableRow
                    key={order._id}
                    order={order}
                    selected={selectedOrders.includes(order._id)}
                    onSelect={(checked) => {
                      if (checked) {
                        setSelectedOrders(prev => [...prev, order._id]);
                      } else {
                        setSelectedOrders(prev => prev.filter(id => id !== order._id));
                      }
                    }}
                    onView={() => handleViewOrder(order._id)}
                    onEdit={() => handleEditOrder(order)}
                    onDelete={() => handleDeleteOrder(order._id)}
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
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
        />
      )}

      {showEditModal && editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => {
            setShowEditModal(false);
            setEditingOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
            setShowEditModal(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon }) => (
  <div className="bg-neutral-900 rounded-lg p-6">
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

// Order Table Row Component
const OrderTableRow = ({
  order,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  getStatusColor,
  getPriorityColor
}) => {
  const rentalItem = order.items.find(item => item.rentalDays);

  return (
    <tr className="hover:bg-neutral-800 transition-colors">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-neutral-600 bg-neutral-700 text-blue-500 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-white">#{order.orderNumber}</div>
          <div className="text-sm text-neutral-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-white">{order.customer.name}</div>
          <div className="text-sm text-neutral-400">{order.customer.email}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-white">
          {rentalItem ? (
            <>
              <div>{rentalItem.rentalDays} days</div>
              {rentalItem.rentalStartDate && (
                <div className="text-xs text-neutral-400">
                  {new Date(rentalItem.rentalStartDate).toLocaleDateString()} -
                  {new Date(rentalItem.rentalEndDate).toLocaleDateString()}
                </div>
              )}
            </>
          ) : (
            <span className="text-neutral-400">N/A</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${order.paymentStatus === 'completed' ? 'text-green-400 bg-green-400/10' :
            order.paymentStatus === 'verification_pending' ? 'text-yellow-400 bg-yellow-400/10' :
              'text-neutral-400 bg-neutral-400/10'
            }`}>
            {order.paymentStatus === 'verification_pending' ? 'Verify' : order.paymentStatus}
          </span>
          {order.paymentSlip?.fileUrl && (
            <span className="text-xs text-lime-500 flex items-center gap-1">
              <FileText size={10} /> Slip Uploaded
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
          {order.priority}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-white">LKR {order.totalAmount.toFixed(2)}/=</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onView}
            className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {order.paymentSlip?.fileUrl && (
            <button
              onClick={() => window.open(order.paymentSlip.fileUrl.startsWith('http') ? order.paymentSlip.fileUrl : `${BASE_URL}${order.paymentSlip.fileUrl}`, '_blank')}
              className="p-2 text-neutral-400 hover:text-lime-400 hover:bg-neutral-800 rounded-lg transition-colors"
              title="View Slip"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onEdit}
            className="p-2 text-neutral-400 hover:text-green-400 hover:bg-neutral-800 rounded-lg transition-colors"
            title="Edit Order"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
            title="Delete Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, getStatusColor, getPriorityColor }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-neutral-900 border border-lime-500 rounded-lg max-w-4xl w-full max-h-[70vh] overflow-y-auto">
      <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Rental Order Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400">Order Number</p>
                <p className="text-white font-medium">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Order Date</p>
                <p className="text-white font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Priority</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </span>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-neutral-400">Tracking Number</p>
                  <p className="text-white font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400">Name</p>
                <p className="text-white font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Email</p>
                <p className="text-white font-medium">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Phone</p>
                <p className="text-white font-medium">{order.customer.phone}</p>
              </div>
            </div>

            <h4 className="text-md font-semibold text-white mt-6 mb-3">Delivery Address</h4>
            <div className="text-white">
              {order.deliveryAddress ? (
                <>
                  <p>{order.deliveryAddress.address}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode || order.deliveryAddress.zipCode}</p>
                  <p>{order.deliveryAddress.country}</p>
                </>
              ) : (
                <p className="text-neutral-400">No delivery required (Customer pickup at shop)</p>
              )}
            </div>
          </div>
        </div>

        {/* Rental Items */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Rental Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="bg-neutral-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-sm text-neutral-400 capitalize">{item.type}</p>
                    {item.rentalDays && (
                      <div className="mt-2">
                        <p className="text-sm text-blue-400">Rental Period: {item.rentalDays} days</p>
                        {item.rentalStartDate && (
                          <p className="text-sm text-neutral-400">
                            {new Date(item.rentalStartDate).toLocaleDateString()} -
                            {new Date(item.rentalEndDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">Qty: {item.quantity}</p>
                    <p className="text-neutral-400">LKR {item.price.toFixed(2)}/= each</p>
                    <p className="text-lime-500 font-medium">LKR {item.subtotal.toFixed(2)}/=</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
          <div className="space-y-2">
            {order.orderType === 'sales' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">LKR {(order.totalAmount - order.tax - order.shippingCost).toFixed(2)}/=</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Delivery</span>
                  <span className="text-white">LKR {order.shippingCost.toFixed(2)}/=</span>
                </div>
                <div className="border-t border-neutral-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-lg font-semibold text-lime-500">LKR {order.totalAmount.toFixed(2)}/=</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-neutral-700/30 p-3 rounded-lg border border-neutral-600/50">
                  <span className="text-lg font-semibold text-white">Total Amount</span>
                  <span className="text-xl font-bold text-lime-500">LKR {order.totalAmount.toFixed(2)}/=</span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 italic">
                    This is a rental order. Items are collected from the shop. No delivery charges apply.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {(order.notes || order.adminNotes) && (
          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
            {order.notes && (
              <div className="mb-3">
                <p className="text-sm text-neutral-400">Customer Notes:</p>
                <p className="text-white">{order.notes}</p>
              </div>
            )}
            {order.adminNotes && (
              <div>
                <p className="text-sm text-neutral-400">Admin Notes:</p>
                <p className="text-white">{order.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Edit Order Modal Component
const EditOrderModal = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: order.status,
    priority: order.priority,
    trackingNumber: order.trackingNumber || '',
    notes: order.notes || '',
    adminNotes: order.adminNotes || '',
    paymentStatus: order.paymentStatus || 'pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/orders/admin/orders/${order._id}`, formData);
      toast.success('Order updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg max-w-2xl border border-lime-500 w-full max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Rental Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Tracking Number</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Customer Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Notes visible to customer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Admin Notes</label>
            <textarea
              value={formData.adminNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Internal notes (not visible to customer)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="pending">Pending</option>
                <option value="verification_pending">Verification Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalOrders;