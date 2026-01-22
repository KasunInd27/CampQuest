// controllers/salesProductController.js
import SalesProduct from '../models/SalesProduct.js';
import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';

// @desc    Get all sales products
// @route   GET /api/sales-products
// @access  Public
export const getSalesProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, category, priceMin, priceMax } = req.query;

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

  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = parseFloat(priceMin);
    if (priceMax) query.price.$lte = parseFloat(priceMax);
  }

  try {
    const products = await SalesProduct.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SalesProduct.countDocuments(query);

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
    console.error('Error fetching sales products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales products',
      error: error.message
    });
  }
});

// @desc    Get single sales product
// @route   GET /api/sales-products/:id
// @access  Public
export const getSalesProduct = asyncHandler(async (req, res) => {
  try {
    const product = await SalesProduct.findById(req.params.id)
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
    console.error('Error fetching sales product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
});

// @desc    Create new sales product
// @route   POST /api/sales-products
// @access  Private (Admin only)
export const createSalesProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, features, specifications, isActive } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    if (!stock || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
      });
    }

    // Process features if provided
    let featuresArray = [];
    if (features) {
      featuresArray = features.split('\n').filter(feature => feature.trim() !== '');
    }

    // Handle images (now URLs from Cloudinary)
    const images = req.body.images || [];

    const productData = {
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      category: category || null,
      brand: brand?.trim() || '',
      stock: parseInt(stock),
      features: featuresArray,
      specifications: specifications?.trim() || '',
      images: images,
      isActive: isActive !== undefined ? isActive : true
    };

    // Add createdBy if user is authenticated
    if (req.user && req.user.id) {
      productData.createdBy = req.user.id;
    }

    const product = await SalesProduct.create(productData);

    // Populate the response
    await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating sales product:', error);

    // (No local files to delete on error)

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
});

// @desc    Update sales product
// @route   PUT /api/sales-products/:id
// @access  Private (Admin only)
export const updateSalesProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, features, specifications, isActive } = req.body;

    let product = await SalesProduct.findById(req.params.id);

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

    // Update images if new ones are provided (replace existing)
    if (req.body.images) {
      updateData.images = req.body.images;
    }

    product = await SalesProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating sales product:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
});

// @desc    Delete sales product
// @route   DELETE /api/sales-products/:id
// @access  Private (Admin only)
export const deleteSalesProduct = asyncHandler(async (req, res) => {
  try {
    const product = await SalesProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // (Cloud images are not deleted locally)

    await SalesProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sales product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    });
  }
});

// @desc    Get sales product statistics
// @route   GET /api/sales-products/stats
// @access  Private (Admin only)
export const getSalesProductStats = asyncHandler(async (req, res) => {
  try {
    const totalProducts = await SalesProduct.countDocuments();
    const activeProducts = await SalesProduct.countDocuments({ isActive: true });
    const inactiveProducts = await SalesProduct.countDocuments({ isActive: false });
    const lowStockProducts = await SalesProduct.countDocuments({ stock: { $lte: 5 } });

    const stats = {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
      lowStock: lowStockProducts
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching sales product statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message
    });
  }
});