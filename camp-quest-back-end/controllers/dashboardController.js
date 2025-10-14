// controllers/dashboardController.js
import SalesProduct from '../models/SalesProduct.js';
import RentalProduct from '../models/RentalProduct.js';
import Order from '../models/Order.js';
import SupportTicket from '../models/SupportTicket.js';
import Feedback from '../models/Feedback.js';
import BlogPost from '../models/BlogPost.js';
import Category from '../models/Category.js';

// Get overall dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Product Statistics
    const totalSalesProducts = await SalesProduct.countDocuments({ isActive: true });
    const totalRentalProducts = await RentalProduct.countDocuments({ isActive: true });
    const totalProducts = totalSalesProducts + totalRentalProducts;

    // Low Stock Items
    const lowStockSalesProducts = await SalesProduct.countDocuments({ 
      stock: { $lt: 10 }, 
      isActive: true 
    });
    const lowStockRentalProducts = await RentalProduct.countDocuments({ 
      availableQuantity: { $lt: 5 }, 
      isActive: true 
    });
    const lowStockItems = lowStockSalesProducts + lowStockRentalProducts;

    // Revenue (Monthly) - Current month
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Previous month revenue for comparison
    const prevMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);

    const prevMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Active Users (Unique customers who placed orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$customer.userId'
        }
      },
      {
        $count: 'totalUsers'
      }
    ]);

    // Calculate revenue change percentage
    const currentRevenue = monthlyRevenue[0]?.totalRevenue || 0;
    const previousRevenue = prevMonthRevenue[0]?.totalRevenue || 0;
    const revenueChangePercent = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : '0.0';

    // Additional stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const totalBlogPosts = await BlogPost.countDocuments({ status: 'published' });

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockItems,
        monthlyRevenue: currentRevenue,
        revenueChange: revenueChangePercent,
        activeUsers: activeUsers[0]?.totalUsers || 0,
        totalOrders,
        pendingOrders,
        openTickets,
        totalBlogPosts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent inventory updates
export const getRecentInventory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent sales products
    const recentSalesProducts = await SalesProduct.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('category', 'name')
      .select('name stock createdAt category');

    // Get recent rental products
    const recentRentalProducts = await RentalProduct.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('category', 'name')
      .select('name availableQuantity quantity createdAt category availabilityStatus');

    // Combine and format the results
    const inventoryUpdates = [];

    recentSalesProducts.forEach(product => {
      inventoryUpdates.push({
        _id: product._id,
        name: product.name,
        type: 'Sales',
        status: product.stock < 10 ? 'Low Stock' : 'In Stock',
        quantity: product.stock,
        date: product.createdAt,
        category: product.category?.name || 'Uncategorized'
      });
    });

    recentRentalProducts.forEach(product => {
      inventoryUpdates.push({
        _id: product._id,
        name: product.name,
        type: 'Rental',
        status: product.availableQuantity < 5 ? 'Low Stock' : product.availabilityStatus,
        quantity: product.availableQuantity,
        totalQuantity: product.quantity,
        date: product.createdAt,
        category: product.category?.name || 'Uncategorized'
      });
    });

    // Sort by date and limit
    inventoryUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedUpdates = inventoryUpdates.slice(0, limit);

    res.json({
      success: true,
      inventory: limitedUpdates
    });
  } catch (error) {
    console.error('Error fetching recent inventory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent customer feedback
export const getRecentFeedback = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .select('subject category rating message createdAt isAnonymous user');

    const formattedFeedback = recentFeedback.map(feedback => ({
      _id: feedback._id,
      name: feedback.isAnonymous ? 'Anonymous User' : (feedback.user?.name || 'Unknown User'),
      email: feedback.isAnonymous ? null : feedback.user?.email,
      subject: feedback.subject,
      category: feedback.category,
      rating: feedback.rating,
      message: feedback.message,
      date: feedback.createdAt,
      isAnonymous: feedback.isAnonymous
    }));

    res.json({
      success: true,
      feedback: formattedFeedback
    });
  } catch (error) {
    console.error('Error fetching recent feedback:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber orderType customer totalAmount status paymentStatus createdAt');

    res.json({
      success: true,
      orders: recentOrders
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get chart data for revenue
export const getRevenueChartData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      chartData: revenueData
    });
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get support ticket statistics
export const getSupportTicketStats = async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });

    // Recent tickets (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTickets = await SupportTicket.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Priority breakdown
    const priorityStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      ticketStats: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        recentTickets,
        priorityBreakdown: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching support ticket stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (req, res) => {
  try {
    // Low stock sales products
    const lowStockSales = await SalesProduct.find({ 
      stock: { $lt: 10 }, 
      isActive: true 
    })
    .populate('category', 'name')
    .select('name stock category createdAt')
    .sort({ stock: 1 })
    .limit(10);

    // Low stock rental products
    const lowStockRentals = await RentalProduct.find({ 
      availableQuantity: { $lt: 5 }, 
      isActive: true 
    })
    .populate('category', 'name')
    .select('name availableQuantity quantity category createdAt')
    .sort({ availableQuantity: 1 })
    .limit(10);

    // Format the data
    const lowStockItems = [];

    lowStockSales.forEach(product => {
      lowStockItems.push({
        _id: product._id,
        name: product.name,
        type: 'Sales',
        currentStock: product.stock,
        category: product.category?.name || 'Uncategorized',
        urgency: product.stock === 0 ? 'critical' : product.stock < 5 ? 'high' : 'medium'
      });
    });

    lowStockRentals.forEach(product => {
      lowStockItems.push({
        _id: product._id,
        name: product.name,
        type: 'Rental',
        currentStock: product.availableQuantity,
        totalStock: product.quantity,
        category: product.category?.name || 'Uncategorized',
        urgency: product.availableQuantity === 0 ? 'critical' : product.availableQuantity < 2 ? 'high' : 'medium'
      });
    });

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2 };
    lowStockItems.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    res.json({
      success: true,
      lowStockItems: lowStockItems.slice(0, 15)
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};