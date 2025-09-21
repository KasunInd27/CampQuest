import Product from '../models/ProductManagement/Product.js';
import Category from '../models/Category.js';

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            minPrice,
            maxPrice,
            brand,
            condition,
            availability,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            featured
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (brand) {
            filter.brand = new RegExp(brand, 'i');
        }

        if (condition) {
            filter.condition = condition;
        }

        if (availability === 'sale') {
            filter['availability.forSale'] = true;
            filter['availability.stock.available'] = { $gt: 0 };
        } else if (availability === 'rent') {
            filter['availability.forRent'] = true;
            filter['availability.stock.available'] = { $gt: 0 };
        }

        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = Number(minPrice);
            if (maxPrice) priceFilter.$lte = Number(maxPrice);
            
            filter.$or = [
                { 'pricing.salePrice': priceFilter },
                { 'pricing.rentalPrice.daily': priceFilter }
            ];
        }

        if (featured === 'true') {
            filter.featured = true;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalProducts: total,
                    hasNext: skip + products.length < total,
                    hasPrev: Number(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
};

// Get single product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ _id: id, isActive: true })
            .populate('category', 'name description')
            .populate('reviews.user', 'name avatar');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: { product }
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching product'
        });
    }
};

// Create new product (Admin only)
export const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Validate category exists
        const category = await Category.findById(productData.category);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => ({
                url: `/uploads/products/${file.filename}`,
                alt: productData.name || 'Product image'
            }));
        }

        const product = new Product(productData);
        await product.save();

        await product.populate('category', 'name');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });

    } catch (error) {
        console.error('Create product error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating product'
        });
    }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate category if provided
        if (updateData.category) {
            const category = await Category.findById(updateData.category);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }
        }

        // Handle new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `/uploads/products/${file.filename}`,
                alt: updateData.name || 'Product image'
            }));
            
            // If images exist, append new ones, otherwise create new array
            if (updateData.images) {
                updateData.images = [...updateData.images, ...newImages];
            } else {
                updateData.images = newImages;
            }
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });

    } catch (error) {
        console.error('Update product error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating product'
        });
    }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product'
        });
    }
};

// Add product review
export const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.user.toString() === userId.toString()
        );

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Add new review
        product.reviews.push({
            user: userId,
            rating: Number(rating),
            comment: comment?.trim() || ''
        });

        // Update average rating
        product.updateRating();
        await product.save();

        await product.populate('reviews.user', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: {
                review: product.reviews[product.reviews.length - 1],
                rating: {
                    average: product.rating.average,
                    count: product.rating.count
                }
            }
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding review'
        });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({
            isActive: true,
            featured: true,
            'availability.stock.available': { $gt: 0 }
        })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

        res.json({
            success: true,
            data: { products }
        });

    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching featured products'
        });
    }
};

// Search products
export const searchProducts = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const products = await Product.find({
            isActive: true,
            $text: { $search: q }
        })
        .populate('category', 'name')
        .limit(Number(limit))
        .lean();

        res.json({
            success: true,
            data: { products }
        });

    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching products'
        });
    }
};
