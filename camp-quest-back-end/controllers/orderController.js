// controllers/orderController.js
import Order from '../models/Order.js';
import User from '../models/User.js';
import SalesProduct from '../models/SalesProduct.js';
import RentalProduct from '../models/RentalProduct.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

// Email configuration (you should move this to environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'campquest512@gmail.com', // Your email
    pass: process.env.SMTP_PASS || 'iwqqkifvraqcuvio'
  }
});

// Helper function to send low stock alerts
const sendLowStockAlert = async (product, productType, currentStock) => {
  try {
    // Get all admin users
    const adminUsers = await User.find({ role: 'admin' }, 'email name');

    if (adminUsers.length === 0) {
      console.log('No admin users found for low stock alert');
      return;
    }

    const adminEmails = adminUsers.map(admin => admin.email);

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: adminEmails.join(','),
      subject: `🚨 Low Stock Alert - ${product.name}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>Type:</strong> ${productType}</p>
        <p><strong>Current Stock:</strong> ${currentStock}</p>
        
        <p style="color: red; font-weight: bold;">
          ⚠️ This product's stock has fallen below the minimum threshold of 5 units.
        </p>
        
        <p>Please consider restocking this item soon to avoid potential stockouts.</p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated alert from your inventory management system.
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Low stock alert sent for ${productType}: ${product.name}`);
  } catch (error) {
    console.error('Error sending low stock alert:', error);
  }
};

// Helper function to update product quantities
const updateProductQuantities = async (items) => {
  const updates = [];
  const lowStockAlerts = [];

  for (const item of items) {
    try {
      let product;
      let productType;
      let quantityField;
      let Model;

      // Determine if it's a sales, rental or package
      if (item.type === 'package') {
        continue; // No quantity to update for packages
      } else if (item.type === 'rental' || item.rentalDays > 0) {
        Model = RentalProduct;
        productType = 'rental';
        quantityField = 'availableQuantity';
      } else {
        Model = SalesProduct;
        productType = 'sales';
        quantityField = 'stock';
      }

      // Find the product
      product = await Model.findById(item.product);

      if (!product) {
        console.error(`Product not found: ${item.product}`);
        continue;
      }

      // Calculate new quantity
      const currentQuantity = product[quantityField];
      const newQuantity = Math.max(0, currentQuantity - item.quantity);

      // Update the product
      const updateResult = await Model.findByIdAndUpdate(
        item.product,
        { [quantityField]: newQuantity },
        { new: true }
      );

      updates.push({
        productId: item.product,
        productName: product.name,
        productType,
        oldQuantity: currentQuantity,
        newQuantity,
        quantityReduced: item.quantity
      });

      // Check if stock is low and add to alert queue
      if (newQuantity <= 5 && newQuantity < currentQuantity) {
        lowStockAlerts.push({
          product: updateResult,
          productType,
          currentStock: newQuantity
        });
      }

      console.log(`Updated ${productType} product ${product.name}: ${currentQuantity} -> ${newQuantity}`);
    } catch (error) {
      console.error(`Error updating product ${item.product}:`, error);
    }
  }

  // Send low stock alerts
  for (const alert of lowStockAlerts) {
    await sendLowStockAlert(alert.product, alert.productType, alert.currentStock);
  }

  return updates;
};

// Updated createOrder function
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.customer || !orderData.items || !orderData.totalAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Missing required order data'
      });
    }

    // Force customer.userId to be the authenticated user ID for security and persistence
    if (!req.user || !req.user._id) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Authentication required to place an order'
      });
    }

    // Always override any userId coming from the client
    orderData.customer = {
      ...(orderData.customer || {}),
      userId: req.user._id
    };

    // Validate stock availability before creating order
    for (const item of orderData.items) {
      // Skip package items - they don't have stock tracking
      if (item.type === 'package') {
        continue;
      }

      let product;
      let quantityField;
      let Model;

      if (item.type === 'rental' || item.rentalDays > 0) {
        Model = RentalProduct;
        quantityField = 'availableQuantity';
      } else {
        Model = SalesProduct;
        quantityField = 'stock';
      }

      product = await Model.findById(item.product).session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product[quantityField] < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product[quantityField]}, Requested: ${item.quantity}`
        });
      }
    }

    // Determine order type if not provided
    let orderType = orderData.orderType;
    if (!orderType) {
      const hasPackageItems = orderData.items.some(item => item.type === 'package');
      const hasRentalItems = orderData.items.some(item =>
        item.type === 'rental' || item.rentalDays > 0
      );

      if (hasPackageItems) {
        orderType = 'package';
      } else {
        orderType = hasRentalItems ? 'rental' : 'sales';
      }
    }

    // Create the order with proper customer userId and orderType
    const order = new Order({
      orderType,
      customer: {
        ...orderData.customer,
        userId: new mongoose.Types.ObjectId(orderData.customer.userId)
      },
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      tax: orderData.tax || orderData.totalAmount * 0.08,
      shippingCost: orderData.shippingCost || 0,
      paymentDetails: orderData.paymentDetails,
      paymentStatus: orderData.paymentStatus || 'pending',
      status: 'pending',
      priority: orderData.priority || 'medium',
      notes: orderData.notes || '',
      adminNotes: orderData.adminNotes || '',
      // Add rental details if it's a rental or package order
      ...((orderType === 'rental' || orderType === 'package') && orderData.rentalDetails && {
        rentalDetails: orderData.rentalDetails
      })
    });

    await order.save({ session });

    // Update product quantities and send alerts (outside transaction for email)
    await session.commitTransaction();

    // Update quantities and send alerts (this happens after successful order creation)
    const quantityUpdates = await updateProductQuantities(orderData.items);

    console.log('Order created successfully with orderType:', order.orderType);
    console.log('Quantity updates:', quantityUpdates);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
      quantityUpdates // Include info about quantity changes
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  } finally {
    session.endSession();
  }
};

// Helper function to restore product quantities (for order cancellation)
const restoreProductQuantities = async (items) => {
  const restorations = [];

  for (const item of items) {
    try {
      let Model;
      let quantityField;

      if (item.type === 'rental' || item.rentalDays > 0) {
        Model = RentalProduct;
        quantityField = 'availableQuantity';
      } else {
        Model = SalesProduct;
        quantityField = 'stock';
      }

      const product = await Model.findById(item.product);

      if (!product) {
        console.error(`Product not found for restoration: ${item.product}`);
        continue;
      }

      const currentQuantity = product[quantityField];
      const newQuantity = currentQuantity + item.quantity;

      await Model.findByIdAndUpdate(
        item.product,
        { [quantityField]: newQuantity }
      );

      restorations.push({
        productId: item.product,
        productName: product.name,
        oldQuantity: currentQuantity,
        newQuantity,
        quantityRestored: item.quantity
      });

      console.log(`Restored stock for ${product.name}: ${currentQuantity} -> ${newQuantity}`);
    } catch (error) {
      console.error(`Error restoring product ${item.product}:`, error);
    }
  }

  return restorations;
};

// Updated cancel order function to restore quantities
export const cancelUserOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const userId = req.user._id;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const order = await Order.findOne({
      _id: id,
      $or: [
        { 'customer.userId': userObjectId },
        { 'customer.id': userObjectId }
      ]
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelReason = cancelReason || 'Cancelled by customer';
    await order.save({ session });

    await session.commitTransaction();

    // Restore product quantities (outside transaction)
    const restorations = await restoreProductQuantities(order.items);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
      restorations // Include info about quantity restorations
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling order:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// Updated admin cancel order function
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelReason = cancelReason || 'Cancelled by admin';
    await order.save({ session });

    await session.commitTransaction();

    // Restore product quantities (outside transaction)
    const restorations = await restoreProductQuantities(order.items);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
      restorations
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling order:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get user's orders (using authenticated user ID)
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build query - check both customer.userId and customer.id fields
    let query = {
      $or: [
        { 'customer.userId': userObjectId },
        { 'customer.id': userObjectId }
      ]
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Get order statistics for user (using authenticated user ID)
export const getUserOrderStats = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('Getting stats for user:', userId);

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build query - check both customer.userId and customer.id fields
    const userQuery = {
      $or: [
        { 'customer.userId': userObjectId },
        { 'customer.id': userObjectId }
      ]
    };

    // Get status breakdown
    const stats = await Order.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get total orders count
    const totalOrders = await Order.countDocuments(userQuery);

    // Get total spent (excluding cancelled orders)
    const totalSpentResult = await Order.aggregate([
      {
        $match: {
          ...userQuery,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // If no orders found, return default stats
    if (totalOrders === 0) {
      return res.json({
        success: true,
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          statusBreakdown: []
        }
      });
    }

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalSpent: totalSpentResult[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error in getUserOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Get single order
export const getUserOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const order = await Order.findOne({
      _id: id,
      $or: [
        { 'customer.userId': userObjectId },
        { 'customer.id': userObjectId }
      ]
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error in getUserOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Update order delivery details (only within 24 hours)
export const updateOrderDeliveryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryAddress, customer } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const order = await Order.findOne({
      _id: id,
      $or: [
        { 'customer.userId': userObjectId },
        { 'customer.id': userObjectId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is within 24 hours
    const orderTime = new Date(order.createdAt);
    const currentTime = new Date();
    const hoursDifference = (currentTime - orderTime) / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      return res.status(400).json({
        success: false,
        message: 'Order details can only be updated within 24 hours of placing the order'
      });
    }

    // Check if order status allows updates
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be updated as it is already in progress'
      });
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        deliveryAddress,
        'customer.name': customer.name,
        'customer.phone': customer.phone
      },
      { new: true, runValidators: true }
    ).populate('items.product');

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin functions remain the same...
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('customer.userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('items.product')
      .populate('customer.userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Access Control: Admin can see everything, users can see their own
    // account for both populated and unpopulated userId fields
    const orderUserId = order.customer?.userId?._id || order.customer?.userId;
    const isOwner = orderUserId && orderUserId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status, trackingNumber, notes },
      { new: true, runValidators: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenueResult[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// controllers/orderController.js - Add these new functions

// controllers/orderController.js - Update getAdminOrders function
export const getAdminOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      orderType,
      priority,
      startDate,
      endDate,
      search
    } = req.query;

    let query = {};

    // Filter by order type (rental/sales)
    if (orderType && orderType !== 'all') {
      query.orderType = orderType;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('customer.userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    console.log(`Found ${orders.length} orders of type ${orderType || 'all'}`);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getAdminOrders:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get admin order statistics
export const getAdminOrderStats = async (req, res) => {
  try {
    const { orderType } = req.query;

    let matchQuery = {};
    if (orderType && orderType !== 'all') {
      matchQuery.orderType = orderType;
    }

    // Get status breakdown
    const statusStats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get priority breakdown
    const priorityStats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total orders count
    const totalOrders = await Order.countDocuments(matchQuery);

    // Get total revenue (excluding cancelled orders)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          ...matchQuery,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      ...matchQuery,
      status: 'pending'
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        pendingOrders,
        statusBreakdown: statusStats,
        priorityBreakdown: priorityStats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status and other details (Admin)
export const updateAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      trackingNumber,
      notes,
      adminNotes,
      priority,
      paymentStatus
    } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.product').populate('customer.userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete order (Admin)
export const deleteAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk update orders (Admin)
export const bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, updateData } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs are required'
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} orders updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Upload Payment Slip
export const uploadSlip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const order = await Order.findOne({
      _id: id,
      $or: [
        { 'customer.userId': req.user._id },
        { 'customer.id': req.user._id }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Update order with slip details
    order.paymentSlip = {
      fileName: req.file.filename,
      fileUrl: `/uploads/payment-slips/${req.file.filename}`,
      uploadedAt: new Date()
    };
    order.paymentMethod = 'slip';
    order.paymentStatus = 'verification_pending';

    await order.save();

    res.json({
      success: true,
      message: 'Payment slip uploaded successfully',
      order
    });
  } catch (error) {
    console.error('Error uploading slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment slip'
    });
  }
};