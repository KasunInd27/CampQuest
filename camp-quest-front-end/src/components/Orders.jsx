// Orders.jsx
import React, { useState, useEffect } from 'react';
import { Package, Eye, Edit, X, Clock, CheckCircle, Truck, AlertCircle, Calendar, MapPin, Phone, Mail, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    console.log('User state:', user); // Debug log
    console.log('Is authenticated:', isAuthenticated); // Debug log
    if (isAuthenticated && user?._id) {
      fetchOrders();
      fetchOrderStats();
    }
  }, [statusFilter, user, isAuthenticated]);

  const fetchOrders = async () => {
    if (!user?._id) {
      console.log('No user ID available');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching orders for user:', user._id); // Debug log
      const { data } = await axios.get(`/orders/user/orders?userId=${user._id}&status=${statusFilter}`);
      console.log('Orders response:', data); // Debug log
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    if (!user?._id) return;
    
    try {
      console.log('Fetching order stats for user:', user._id); // Debug log
      const { data } = await axios.get(`/orders/user/orders/stats?userId=${user._id}`);
      console.log('Order stats response:', data); // Debug log
      setOrderStats(data.stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      // Set default stats instead
      setOrderStats({
        totalOrders: 0,
        totalSpent: 0,
        statusBreakdown: []
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-400/10',
      processing: 'text-blue-400 bg-blue-400/10',
      shipped: 'text-purple-400 bg-purple-400/10',
      delivered: 'text-lime-500 bg-lime-500/10',
      cancelled: 'text-red-400 bg-red-400/10',
      returned: 'text-gray-400 bg-gray-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: X,
      returned: AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const canEditOrder = (order) => {
    const orderTime = new Date(order.createdAt);
    const currentTime = new Date();
    const hoursDifference = (currentTime - orderTime) / (1000 * 60 * 60);
    
    return hoursDifference <= 24 && ['pending', 'processing'].includes(order.status);
  };

  const canCancelOrder = (order) => {
    return ['pending', 'processing'].includes(order.status);
  };

  const handleViewOrder = async (orderId) => {
    if (!user?._id) return;
    
    try {
      const { data } = await axios.get(`/orders/user/orders/${orderId}?userId=${user._id}`);
      setSelectedOrder(data.order);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleCancelOrder = (order) => {
    setCancellingOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async (cancelReason) => {
    if (!cancellingOrder || !user?._id) return;

    try {
      const { data } = await axios.put(`/orders/user/orders/${cancellingOrder._id}/cancel`, {
        userId: user._id,
        cancelReason: cancelReason || 'Cancelled by customer'
      });

      if (data.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders list
        fetchOrders();
        fetchOrderStats();
        // Close modal
        setShowCancelModal(false);
        setCancellingOrder(null);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <p className="text-white mb-4">Please login to view your orders</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      {orderStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Orders</p>
                <h3 className="text-2xl font-bold text-white mt-1">{orderStats.totalOrders}</h3>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Spent</p>
                <h3 className="text-2xl font-bold text-white mt-1">LKR {orderStats.totalSpent.toFixed(2)}/=</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-lime-500" />
            </div>
          </div>
          
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Average Order</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  LKR {orderStats.totalOrders > 0 ? (orderStats.totalSpent / orderStats.totalOrders).toFixed(2) : '0.00'}/=
                </h3>
              </div>
              <Truck className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-neutral-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">My Orders</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-neutral-900 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-neutral-400">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No orders found with status: ${statusFilter}`
              }
            </p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onView={() => handleViewOrder(order._id)}
              onEdit={() => handleEditOrder(order)}
              onCancel={() => handleCancelOrder(order)}
              canEdit={canEditOrder(order)}
              canCancel={canCancelOrder(order)}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <EditOrderModal
          order={editingOrder}
          userId={user._id}
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

      {/* Cancel Order Modal */}
      {showCancelModal && cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          onClose={() => {
            setShowCancelModal(false);
            setCancellingOrder(null);
          }}
          onConfirm={confirmCancelOrder}
        />
      )}
    </div>
  );
};

// Updated OrderCard component with cancel button
const OrderCard = ({ order, onView, onEdit, onCancel, canEdit, canCancel, getStatusColor, getStatusIcon }) => {
  return (
    <div className="bg-neutral-900 rounded-lg p-6 hover:bg-neutral-800 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-neutral-400">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 capitalize">{order.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-neutral-400">Items</p>
              <p className="text-white font-medium">{order.items.length} item(s)</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Amount</p>
              <p className="text-white font-medium">LKR {order.totalAmount.toFixed(2)}/=</p>
            </div>
          </div>

          <div className="flex items-center text-sm text-neutral-400">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onView}
            className="flex items-center px-4 py-2 bg-blue-600/70 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </button>
          {canEdit && (
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-600 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
          {canCancel && (
            <button
              onClick={onCancel}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, getStatusColor, getStatusIcon }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-lime-500 rounded-lg max-w-4xl w-full max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-400">Order Number</p>
                  <p className="text-white font-medium">{order.orderNumber}</p>
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
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-neutral-400">Tracking Number</p>
                    <p className="text-white font-medium">{order.trackingNumber}</p>
                  </div>
                )}
                {order.cancelReason && (
                  <div>
                    <p className="text-sm text-neutral-400">Cancel Reason</p>
                    <p className="text-red-400 font-medium">{order.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Delivery Address</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-white">{order.deliveryAddress.address}</p>
                    <p className="text-neutral-400">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                    </p>
                    <p className="text-neutral-400">{order.deliveryAddress.country}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-700">
                <h4 className="text-md font-semibold text-white mb-3">Customer Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-neutral-300">{order.customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-neutral-300">{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-sm text-neutral-400 capitalize">{item.type}</p>
                      {item.rentalDays && (
                        <p className="text-sm text-blue-400">Rental Days: {item.rentalDays}</p>
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
              <div className="flex justify-between">
                <span className="text-neutral-400">Subtotal</span>
                <span className="text-white">LKR {(order.totalAmount - order.shippingCost).toFixed(2)}/=</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Delivery Fee</span>
                <span className="text-white">LKR {order.shippingCost.toFixed(2)}/=</span>
              </div>
              <div className="border-t border-neutral-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-lg font-semibold text-lime-500">LKR {order.totalAmount.toFixed(2)}/=</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Order Modal Component
const EditOrderModal = ({ order, userId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: {
      name: order.customer.name,
      phone: order.customer.phone
    },
    deliveryAddress: {
      address: order.deliveryAddress.address,
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      zipCode: order.deliveryAddress.zipCode,
      country: order.deliveryAddress.country
    }
  });

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.put(`/orders/user/orders/${order._id}/delivery`, {
        ...formData,
        userId
      });
      toast.success('Order updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const orderTime = new Date(order.createdAt);
  const currentTime = new Date();
  const hoursLeft = 24 - ((currentTime - orderTime) / (1000 * 60 * 60));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-lime-500 rounded-lg max-w-2xl w-full max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Edit Order</h2>
              <p className="text-sm text-yellow-400 mt-1">
                <Clock className="w-4 h-4 inline mr-1" />
                {hoursLeft > 0 ? `${Math.floor(hoursLeft)} hours left to edit` : 'Edit time expired'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.customer.name}
                  onChange={(e) => handleChange('customer', 'name', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.customer.phone}
                  onChange={(e) => handleChange('customer', 'phone', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Delivery Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress.address}
                  onChange={(e) => handleChange('deliveryAddress', 'address', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => handleChange('deliveryAddress', 'city', e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.state}
                    onChange={(e) => handleChange('deliveryAddress', 'state', e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.zipCode}
                    onChange={(e) => handleChange('deliveryAddress', 'zipCode', e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              disabled={loading || hoursLeft <= 0}
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

// Cancel Order Modal Component
const CancelOrderModal = ({ order, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(cancelReason);
    } catch (error) {
      console.error('Error in cancel confirmation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-red-500 rounded-lg max-w-md w-full h-[70vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Cancel Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-medium">Are you sure?</h3>
                  <p className="text-red-300 text-sm mt-1">
                    This will cancel your order #{order.orderNumber}. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling this order..."
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white resize-none"
                rows="3"
                maxLength="500"
              />
              <p className="text-xs text-neutral-400 mt-1">
                {cancelReason.length}/500 characters
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;