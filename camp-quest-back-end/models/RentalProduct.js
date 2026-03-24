import mongoose from 'mongoose';

const rentalProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  dailyRate: {
    type: Number,
    required: [true, 'Daily rate is required'],
    min: [0, 'Daily rate cannot be negative']
  },
  weeklyRate: {
    type: Number,
    min: [0, 'Weekly rate cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  availableQuantity: {
    type: Number,
    min: [0, 'Available quantity cannot be negative']
  },
  images: [{
    type: String
  }],
  features: [{
    type: String
  }],
  specifications: {
    type: String
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs-repair'],
    default: 'excellent'
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'unavailable'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create slug from name before saving
rentalProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  
  // Set available quantity equal to total quantity if not set
  if (this.isModified('quantity') && !this.isModified('availableQuantity')) {
    this.availableQuantity = this.quantity;
  }
  
  // Update availability status based on available quantity
  if (this.availableQuantity === 0) {
    this.availabilityStatus = 'unavailable';
  } else if (this.availabilityStatus === 'unavailable' && this.availableQuantity > 0) {
    this.availabilityStatus = 'available';
  }
  
  next();
});

// Index for better search performance
rentalProductSchema.index({ name: 'text', description: 'text', brand: 'text' });
rentalProductSchema.index({ category: 1, availabilityStatus: 1, isActive: 1 });

const RentalProduct = mongoose.model('RentalProduct', rentalProductSchema);

export default RentalProduct;