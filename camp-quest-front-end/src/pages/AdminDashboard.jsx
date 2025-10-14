// pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertCircle, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Star,
  Package2,
  FileText
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentInventory, setRecentInventory] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [
        statsRes,
        inventoryRes,
        feedbackRes,
        ordersRes,
        lowStockRes
      ] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/inventory/recent?limit=5'),
        axios.get('/dashboard/feedback/recent?limit=5'),
        axios.get('/dashboard/orders/recent?limit=5'),
        axios.get('/dashboard/alerts/low-stock')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (inventoryRes.data.success) setRecentInventory(inventoryRes.data.inventory);
      if (feedbackRes.data.success) setRecentFeedback(feedbackRes.data.feedback);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders);
      if (lowStockRes.data.success) setLowStockAlerts(lowStockRes.data.lowStockItems);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-neutral-400">Welcome back! Here's what's happening with your business.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-500 transition-colors font-medium"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={<Package className="text-blue-400" />}
          change=""
          subtext="Active products"
        />
        <DashboardCard
          title="Low Stock Items"
          value={stats?.lowStockItems || 0}
          icon={<AlertCircle className="text-red-400" />}
          change=""
          subtext="Need attention"
          urgent={stats?.lowStockItems > 0}
        />
        <DashboardCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={<DollarSign className="text-green-400" />}
          change={`${stats?.revenueChange || 0}%`}
          positive={parseFloat(stats?.revenueChange || 0) >= 0}
          subtext="This month"
        />
        <DashboardCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={<Users className="text-purple-400" />}
          change=""
          subtext="Last 30 days"
        />
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingCart className="text-orange-400" />}
          change=""
          subtext="All time"
        />
        <DashboardCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<Package2 className="text-yellow-400" />}
          change=""
          subtext="Need processing"
        />
        <DashboardCard
          title="Open Tickets"
          value={stats?.openTickets || 0}
          icon={<MessageSquare className="text-cyan-400" />}
          change=""
          subtext="Support requests"
        />
        <DashboardCard
          title="Blog Posts"
          value={stats?.totalBlogPosts || 0}
          icon={<FileText className="text-indigo-400" />}
          change=""
          subtext="Published"
        />
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Inventory Updates */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Inventory Updates</h2>
            <Package className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {recentInventory.length > 0 ? (
              recentInventory.map((item) => (
                <InventoryItem
                  key={item._id}
                  name={item.name}
                  type={item.type}
                  status={item.status}
                  quantity={item.quantity}
                  totalQuantity={item.totalQuantity}
                  date={formatDate(item.date)}
                  category={item.category}
                />
              ))
            ) : (
              <p className="text-neutral-400 text-center py-8">No recent inventory updates</p>
            )}
          </div>
        </div>
        
        {/* Recent Customer Feedback */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Customer Feedback</h2>
            <Star className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((feedback) => (
                <FeedbackItem
                  key={feedback._id}
                  name={feedback.name}
                  rating={feedback.rating}
                  message={feedback.message}
                  date={formatDate(feedback.date)}
                  category={feedback.category}
                  isAnonymous={feedback.isAnonymous}
                />
              ))
            ) : (
              <p className="text-neutral-400 text-center py-8">No recent feedback</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders and Low Stock Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <ShoppingCart className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <OrderItem
                  key={order._id}
                  orderNumber={order.orderNumber}
                  customerName={order.customer.name}
                  orderType={order.orderType}
                  amount={formatCurrency(order.totalAmount)}
                  status={order.status}
                  date={formatDate(order.createdAt)}
                />
              ))
            ) : (
              <p className="text-neutral-400 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="space-y-4">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.slice(0, 5).map((item) => (
                <LowStockItem
                  key={item._id}
                  name={item.name}
                  type={item.type}
                  currentStock={item.currentStock}
                  totalStock={item.totalStock}
                  category={item.category}
                  urgency={item.urgency}
                />
              ))
            ) : (
              <p className="text-neutral-400 text-center py-8">All items are well stocked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({ title, value, icon, change, positive, subtext, urgent }) {
  return (
    <div className={`bg-neutral-900 rounded-lg p-6 border ${urgent ? 'border-red-500/50' : 'border-neutral-700'}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="text-sm text-neutral-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {change && (
          <div className={`text-sm flex items-center ${positive ? 'text-lime-500' : 'text-red-400'}`}>
            {positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change} from last month
          </div>
        )}
        {subtext && (
          <p className={`text-sm ${change ? 'mt-1' : ''} text-neutral-500`}>{subtext}</p>
        )}
      </div>
    </div>
  );
}

// Inventory Item Component
function InventoryItem({ name, type, status, quantity, totalQuantity, date, category }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'low stock': return 'text-red-400';
      case 'in stock': return 'text-lime-500';
      case 'available': return 'text-lime-500';
      case 'rented': return 'text-yellow-400';
      case 'maintenance': return 'text-orange-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="flex justify-between items-center border-b border-neutral-800 pb-3 last:border-b-0 last:pb-0">
      <div className="flex-1">
        <p className="font-medium text-white">{name}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded">{type}</span>
          <span className="text-xs text-neutral-500">{category}</span>
        </div>
        <p className={`text-sm mt-1 ${getStatusColor(status)}`}>
          {status}
        </p>
      </div>
      <div className="text-right">
        <p className="text-neutral-300">
          {quantity} {totalQuantity ? `/ ${totalQuantity}` : ''} units
        </p>
        <p className="text-xs text-neutral-500 mt-1">{date}</p>
      </div>
    </div>
  );
}

// Feedback Item Component
function FeedbackItem({ name, rating, message, date, category, isAnonymous }) {
  return (
    <div className="border-b border-neutral-800 pb-3 last:border-b-0 last:pb-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-white">{name}</p>
          {isAnonymous && <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded">Anonymous</span>}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < rating ? 'text-lime-500' : 'text-neutral-600'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded capitalize">{category}</span>
        </div>
      </div>
      <p className="text-sm text-neutral-300 mb-1 line-clamp-2">{message}</p>
      <p className="text-xs text-neutral-500">{date}</p>
    </div>
  );
}

// Order Item Component
function OrderItem({ orderNumber, customerName, orderType, amount, status, date }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/20';
      case 'shipped': return 'text-purple-400 bg-purple-400/20';
      case 'delivered': return 'text-lime-500 bg-lime-500/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-neutral-400 bg-neutral-400/20';
    }
  };

  return (
    <div className="flex justify-between items-center border-b border-neutral-800 pb-3 last:border-b-0 last:pb-0">
      <div className="flex-1">
        <p className="font-medium text-white">{orderNumber}</p>
        <p className="text-sm text-neutral-400">{customerName}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded capitalize">{orderType}</span>
          <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-white">{amount}</p>
        <p className="text-xs text-neutral-500 mt-1">{date}</p>
      </div>
    </div>
  );
}

// Low Stock Item Component
function LowStockItem({ name, type, currentStock, totalStock, category, urgency }) {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-neutral-400 bg-neutral-400/20';
    }
  };

  return (
    <div className="flex justify-between items-center border-b border-neutral-800 pb-3 last:border-b-0 last:pb-0">
      <div className="flex-1">
        <p className="font-medium text-white">{name}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded">{type}</span>
          <span className="text-xs text-neutral-500">{category}</span>
          <span className={`text-xs px-2 py-1 rounded capitalize ${getUrgencyColor(urgency)}`}>
            {urgency}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-neutral-300">
          {currentStock} {totalStock ? `/ ${totalStock}` : ''} units
        </p>
        {urgency === 'critical' && <p className="text-xs text-red-400 mt-1">Out of Stock!</p>}
      </div>
    </div>
  );
}