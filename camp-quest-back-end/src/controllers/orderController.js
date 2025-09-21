import Order from '../models/Order.js';
import Product from '../models/ProductManagement/Product.js';
import User from '../models/UserManagement/User.js';

// Create new order
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            type,
            paymentMethod,
            shippingAddress,
            notes
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!['rental', 'purchase'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Order type must be either "rental" or "purchase"'
            });
        }

        // Validate and process items
        const processedItems = [];
        let subtotal = 0;
        let totalDeposit = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product} not found or inactive`
                });
            }

            // Check availability
            if (product.availability.stock.available < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.availability.stock.available}`
                });
            }

            // Check if product is available for the requested type
            if (type === 'rental' && !product.availability.forRent) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is not available for rental`
                });
            }

            if (type === 'purchase' && !product.availability.forSale) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is not available for purchase`
                });
            }

            let unitPrice;
            let totalPrice;

            if (type === 'rental') {
                if (!item.rentalPeriod || !item.rentalPeriod.duration) {
                    return res.status(400).json({
                        success: false,
                        message: 'Rental period is required for rental orders'
                    });
                }

                const { duration } = item.rentalPeriod;
                
                if (duration.unit === 'days') {
                    unitPrice = product.pricing.rentalPrice.daily;
                } else if (duration.unit === 'weeks') {
                    unitPrice = product.pricing.rentalPrice.weekly || (product.pricing.rentalPrice.daily * 7);
                } else if (duration.unit === 'months') {
                    unitPrice = product.pricing.rentalPrice.monthly || (product.pricing.rentalPrice.daily * 30);
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid rental duration unit'
                    });
                }

                totalPrice = unitPrice * duration.value * item.quantity;
                totalDeposit += product.pricing.deposit * item.quantity;

                // Calculate rental dates
                const startDate = new Date(item.rentalPeriod.startDate);
                const endDate = new Date(startDate);
                
                if (duration.unit === 'days') {
                    endDate.setDate(startDate.getDate() + duration.value);
                } else if (duration.unit === 'weeks') {
                    endDate.setDate(startDate.getDate() + (duration.value * 7));
                } else if (duration.unit === 'months') {
                    endDate.setMonth(startDate.getMonth() + duration.value);
                }

                item.rentalPeriod.endDate = endDate;
            } else {
                unitPrice = product.pricing.salePrice;
                totalPrice = unitPrice * item.quantity;
            }

            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                rentalPeriod: item.rentalPeriod
            });

            subtotal += totalPrice;
        }

        // Calculate taxes and total
        const taxRate = 0.08; // 8% tax rate
        const tax = subtotal * taxRate;
        const shipping = type === 'rental' ? 0 : 15; // Free shipping for rentals
        const total = subtotal + totalDeposit + tax + shipping;

        // Create order
        const order = new Order({
            customer: req.user._id,
            type,
            items: processedItems,
            pricing: {
                subtotal,
                deposit: totalDeposit,
                tax,
                shipping,
                total
            },
            paymentMethod,
            shippingAddress,
            notes: {
                customer: notes
            }
        });

        await order.save();

        // Update product stock
        for (const item of processedItems) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        'availability.stock.available': -item.quantity,
                        'availability.stock.rented': type === 'rental' ? item.quantity : 0
                    }
                }
            );
        }

        // Add order to user's rentals if it's a rental
        if (type === 'rental') {
            await User.findByIdAndUpdate(
                req.user._id,
                { $push: { rentals: order._id } }
            );
        }

        await order.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'items.product', select: 'name images brand' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });

    } catch (error) {
        console.error('Create order error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

// Get user orders
export const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const userId = req.user._id;

        const filter = { customer: userId };
        if (status) filter.status = status;
        if (type) filter.type = type;

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(filter)
            .populate('items.product', 'name images brand')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalOrders: total,
                    hasNext: skip + orders.length < total,
                    hasPrev: Number(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const filter = { _id: id };
        if (!isAdmin) {
            filter.customer = userId;
        }

        const order = await Order.findOne(filter)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images brand category')
            .populate('items.product.category', 'name');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: { order }
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order'
        });
    }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, tracking } = req.body;

        const validStatuses = [
            'pending', 'confirmed', 'processing', 'shipped', 'delivered',
            'active', 'returned', 'completed', 'cancelled', 'refunded'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const updateData = { status };
        if (notes) updateData['notes.admin'] = notes;
        if (tracking) updateData.tracking = tracking;

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'items.product', select: 'name images brand' }
        ]);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // If order is cancelled or returned, restore product stock
        if (['cancelled', 'returned'].includes(status)) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.product._id,
                    {
                        $inc: {
                            'availability.stock.available': item.quantity,
                            'availability.stock.rented': order.type === 'rental' ? -item.quantity : 0
                        }
                    }
                );
            }
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating order status'
        });
    }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            customer,
            startDate,
            endDate
        } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (customer) filter.customer = customer;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(filter)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name brand')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalOrders: total,
                    hasNext: skip + orders.length < total,
                    hasPrev: Number(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const filter = { _id: id };
        if (!isAdmin) {
            filter.customer = userId;
        }

        const order = await Order.findOne(filter);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        const cancellableStatuses = ['pending', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        order.status = 'cancelled';
        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        'availability.stock.available': item.quantity,
                        'availability.stock.rented': order.type === 'rental' ? -item.quantity : 0
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: { order }
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling order'
        });
    }
};
