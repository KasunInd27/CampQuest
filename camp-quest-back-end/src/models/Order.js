import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required']
    },
    type: {
        type: String,
        enum: ['rental', 'purchase'],
        required: [true, 'Order type is required']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, 'Unit price cannot be negative']
        },
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'Total price cannot be negative']
        },
        // For rental orders
        rentalPeriod: {
            startDate: Date,
            endDate: Date,
            duration: {
                value: Number,
                unit: {
                    type: String,
                    enum: ['days', 'weeks', 'months']
                }
            }
        }
    }],
    pricing: {
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative']
        },
        deposit: {
            type: Number,
            default: 0,
            min: [0, 'Deposit cannot be negative']
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'Tax cannot be negative']
        },
        shipping: {
            type: Number,
            default: 0,
            min: [0, 'Shipping cost cannot be negative']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative']
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative']
        }
    },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'active', // for ongoing rentals
            'returned',
            'completed',
            'cancelled',
            'refunded'
        ],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
        required: [true, 'Payment method is required']
    },
    shippingAddress: {
        name: {
            type: String,
            required: [true, 'Shipping name is required']
        },
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required']
        },
        phone: String
    },
    tracking: {
        carrier: String,
        trackingNumber: String,
        estimatedDelivery: Date,
        actualDelivery: Date
    },
    notes: {
        customer: String,
        admin: String
    },
    // For rental orders
    rental: {
        pickupDate: Date,
        returnDate: Date,
        actualReturnDate: Date,
        condition: {
            pickup: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor']
            },
            return: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor']
            }
        },
        damageCharges: {
            type: Number,
            default: 0,
            min: [0, 'Damage charges cannot be negative']
        },
        lateReturnFee: {
            type: Number,
            default: 0,
            min: [0, 'Late return fee cannot be negative']
        }
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `CQ${timestamp.slice(-6)}${random}`;
    }
    next();
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
    // Calculate subtotal from items
    this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate total
    this.pricing.total = this.pricing.subtotal + 
                        this.pricing.deposit + 
                        this.pricing.tax + 
                        this.pricing.shipping - 
                        this.pricing.discount;
    
    next();
});

// Indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ type: 1 });
orderSchema.index({ 'rental.returnDate': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
