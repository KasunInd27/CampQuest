// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  orderType: {
    type: String,
    enum: ['rental', 'sales', 'package'],
    required: true,
    default: 'sales'
  },
  // ...
  productModel: {
    type: String,
    enum: ['SalesProduct', 'RentalProduct', 'SpecialPackage']
  },
  name: String,
  type: {
    type: String,
    enum: ['sale', 'rental', 'package'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  rentalDays: Number, // Only for rental items
  rentalStartDate: Date, // Only for rental items
  rentalEndDate: Date, // Only for rental items
  subtotal: {
    type: Number,
    required: true
  }
}],
  rentalDetails: {
  startDate: Date,
  endDate: Date,
  returnDate: Date,
  status: {
    type: String,
    enum: ['pending', 'active', 'returned', 'overdue'],
    default: 'pending'
  }
},
  paymentDetails: {
  method: {
    type: String,
    enum: ['card', 'paypal', 'cash', 'slip'],
    required: true
  },
  transactionId: String,
  amount: {
    type: Number,
    required: true
  }
},
  paymentSlip: {
  fileName: String,
  fileUrl: String,
  mimeType: String,
  size: Number,
  uploadedAt: Date
},
  totalAmount: {
  type: Number,
  required: true
},
  tax: {
  type: Number,
  default: 0
},
  shippingCost: {
  type: Number,
  default: 0
},
  status: {
  type: String,
  enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'],
  default: 'pending'
},
  paymentStatus: {
  type: String,
  enum: ['pending', 'verification_pending', 'completed', 'failed', 'refunded'],
  default: 'pending'
},
  priority: {
  type: String,
  enum: ['low', 'medium', 'high', 'urgent'],
  default: 'medium'
},
  notes: String, // Customer notes
  adminNotes: String, // Internal admin notes (not visible to customer)
  trackingNumber: String,
  cancelReason: String,
  refundAmount: Number,
  refundDate: Date
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${Date.now()}${count + 1}`;
  }
  next();
});

// Calculate tax before saving
orderSchema.pre('save', function (next) {
  if (!this.tax) {
    this.tax = this.totalAmount * 0.08; // 8% tax
  }
  next();
});

// Virtual for determining if order is rental or package
orderSchema.virtual('isRental').get(function () {
  return this.orderType === 'rental' || this.orderType === 'package';
});

// Virtual for determining if order is sales
orderSchema.virtual('isSales').get(function () {
  return this.orderType === 'sales';
});

// Virtual for checking if order can be edited (within 24 hours and pending/processing)
orderSchema.virtual('canBeEdited').get(function () {
  const orderTime = new Date(this.createdAt);
  const currentTime = new Date();
  const hoursDifference = (currentTime - orderTime) / (1000 * 60 * 60);

  return hoursDifference <= 24 && ['pending', 'processing'].includes(this.status);
});

// Virtual for getting rental duration
orderSchema.virtual('rentalDuration').get(function () {
  if (this.orderType === 'rental' && this.rentalDetails.startDate && this.rentalDetails.endDate) {
    const startDate = new Date(this.rentalDetails.startDate);
    const endDate = new Date(this.rentalDetails.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Instance method to check if order is overdue (for rentals)
orderSchema.methods.isOverdue = function () {
  if (this.orderType === 'rental' && this.rentalDetails.endDate) {
    const currentDate = new Date();
    const endDate = new Date(this.rentalDetails.endDate);
    return currentDate > endDate && this.status !== 'returned' && this.status !== 'completed';
  }
  return false;
};

// Instance method to calculate late fees (for rentals)
orderSchema.methods.calculateLateFees = function (dailyLateFee = 10) {
  if (this.isOverdue()) {
    const currentDate = new Date();
    const endDate = new Date(this.rentalDetails.endDate);
    const overdueDays = Math.ceil((currentDate - endDate) / (1000 * 60 * 60 * 24));
    return overdueDays * dailyLateFee;
  }
  return 0;
};

// Static method to find orders by type
orderSchema.statics.findByType = function (orderType) {
  return this.find({ orderType });
};

// Static method to find overdue rentals
orderSchema.statics.findOverdueRentals = function () {
  const currentDate = new Date();
  return this.find({
    orderType: 'rental',
    'rentalDetails.endDate': { $lt: currentDate },
    status: { $nin: ['returned', 'completed', 'cancelled'] }
  });
};

// Static method to get order statistics
orderSchema.statics.getStats = async function (orderType = null) {
  const matchQuery = orderType ? { orderType } : {};

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' },
        statusBreakdown: {
          $push: {
            status: '$status',
            count: 1,
            amount: '$totalAmount'
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    statusBreakdown: []
  };
};

// Index for better performance
orderSchema.index({ orderType: 1, status: 1 });
orderSchema.index({ 'customer.userId': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'rentalDetails.endDate': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;