import RentalProduct from '../models/RentalProduct.js';
import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';

// @desc    Get all rental products
// @route   GET /api/rental-products
// @access  Public
export const getRentalProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, category, availability, priceMin, priceMax } = req.query;
  
  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }

  if (availability) {
    query.availabilityStatus = availability;
  }
  
  if (priceMin || priceMax) {
    query.dailyRate = {};
    if (priceMin) query.dailyRate.$gte = parseFloat(priceMin);
    if (priceMax) query.dailyRate.$lte = parseFloat(priceMax);
  }

  try {
    const products = await RentalProduct.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RentalProduct.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching rental products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental products',
      error: error.message
    });
  }
});

// @desc    Get single rental product
// @route   GET /api/rental-products/:id
// @access  Public
export const getRentalProduct = asyncHandler(async (req, res) => {
  try {
    const product = await RentalProduct.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching rental product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
});

// @desc    Create new rental product
// @route   POST /api/rental-products
// @access  Private (Admin only)
export const createRentalProduct = asyncHandler(async (req, res) => {
  try {
    const { 
      name, description, dailyRate, weeklyRate,
      category, brand, quantity, features, specifications, condition, 
      availabilityStatus, isActive 
    } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!dailyRate || dailyRate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid daily rate is required'
      });
    }

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Process features if provided
    let featuresArray = [];
    if (features) {
      featuresArray = features.split('\n').filter(feature => feature.trim() !== '');
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => file.filename) : [];

    const productData = {
      name: name.trim(),
      description: description?.trim() || '',
      dailyRate: parseFloat(dailyRate),
      weeklyRate: weeklyRate ? parseFloat(weeklyRate) : undefined,
      category: category || null,
      brand: brand?.trim() || '',
      quantity: parseInt(quantity),
      availableQuantity: parseInt(quantity),
      features: featuresArray,
      specifications: specifications?.trim() || '',
      condition: condition || 'excellent',
      availabilityStatus: availabilityStatus || 'available',
      images: images,
      isActive: isActive !== undefined ? isActive : true
    };

    // Add createdBy if user is authenticated
    if (req.user && req.user.id) {
      productData.createdBy = req.user.id;
    }

    const product = await RentalProduct.create(productData);
    
    // Populate the response
    await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Rental product created successfully'
    });
  } catch (error) {
    console.error('Error creating rental product:', error);
    
    // Delete uploaded files if product creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating rental product',
      error: error.message
    });
  }
});

// @desc    Update rental product
// @route   PUT /api/rental-products/:id
// @access  Private (Admin only)
export const updateRentalProduct = asyncHandler(async (req, res) => {
  try {
    const { 
      name, description, dailyRate, weeklyRate,
      category, brand, quantity, features, specifications, condition, 
      availabilityStatus, isActive 
    } = req.body;

    let product = await RentalProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Process features if provided
    let featuresArray = [];
    if (features) {
      featuresArray = features.split('\n').filter(feature => feature.trim() !== '');
    }

    // Handle uploaded images
    const newImages = req.files ? req.files.map(file => file.filename) : [];

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (dailyRate !== undefined) updateData.dailyRate = parseFloat(dailyRate);
    if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate ? parseFloat(weeklyRate) : undefined;
    if (category !== undefined) updateData.category = category || null;
    if (brand !== undefined) updateData.brand = brand.trim();
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
      // Update available quantity proportionally if not manually set
      const quantityDiff = parseInt(quantity) - product.quantity;
      updateData.availableQuantity = Math.max(0, product.availableQuantity + quantityDiff);
    }
    if (features !== undefined) updateData.features = featuresArray;
    if (specifications !== undefined) updateData.specifications = specifications.trim();
    if (condition !== undefined) updateData.condition = condition;
    if (availabilityStatus !== undefined) updateData.availabilityStatus = availabilityStatus;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update images if new ones are uploaded
    if (newImages.length > 0) {
      updateData.images = [...(product.images || []), ...newImages];
    }

    product = await RentalProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    res.status(200).json({
      success: true,
      data: product,
      message: 'Rental product updated successfully'
    });
  } catch (error) {
    console.error('Error updating rental product:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating rental product',
      error: error.message
    });
  }
});

// @desc    Update product quantity (when order is placed)
// @route   PUT /api/rental-products/:id/quantity
// @access  Private
export const updateProductQuantity = asyncHandler(async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await RentalProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity available'
      });
    }

    product.availableQuantity -= quantity;
    
    // Update availability status if needed
    if (product.availableQuantity === 0) {
      product.availabilityStatus = 'unavailable';
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product quantity updated successfully'
    });
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product quantity',
      error: error.message
    });
  }
});

// @desc    Delete rental product
// @route   DELETE /api/rental-products/:id
// @access  Private (Admin only)
export const deleteRentalProduct = asyncHandler(async (req, res) => {
  try {
    const product = await RentalProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const imagePath = path.join('../camp-quest-front-end/public/uploads/rental-products', image);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      });
    }

    await RentalProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Rental product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rental product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rental product',
      error: error.message
    });
  }
});

// @desc    Get rental product statistics
// @route   GET /api/rental-products/stats
// @access  Private (Admin only)
export const getRentalProductStats = asyncHandler(async (req, res) => {
  try {
    const totalProducts = await RentalProduct.countDocuments();
    const activeProducts = await RentalProduct.countDocuments({ isActive: true });
    const availableProducts = await RentalProduct.countDocuments({ availabilityStatus: 'available' });
    const rentedProducts = await RentalProduct.countDocuments({ availabilityStatus: 'rented' });
    const maintenanceProducts = await RentalProduct.countDocuments({ availabilityStatus: 'maintenance' });

    const stats = {
      total: totalProducts,
      active: activeProducts,
      available: availableProducts,
      rented: rentedProducts,
      maintenance: maintenanceProducts
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching rental product statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message
    });
  }
});