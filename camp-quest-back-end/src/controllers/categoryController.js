import Category from '../models/Category.js';
import Product from '../models/ProductManagement/Product.js';

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const { includeInactive = false } = req.query;
        
        const filter = includeInactive === 'true' ? {} : { isActive: true };
        
        const categories = await Category.find(filter)
            .populate('parentCategory', 'name')
            .populate('subcategories', 'name description image')
            .sort({ name: 1 });

        res.json({
            success: true,
            data: { categories }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories'
        });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id)
            .populate('parentCategory', 'name description')
            .populate('subcategories', 'name description image');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get products count in this category
        const productCount = await Product.countDocuments({
            category: id,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                category,
                productCount
            }
        });

    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category'
        });
    }
};

// Create new category (Admin only)
export const createCategory = async (req, res) => {
    try {
        const { name, description, parentCategory } = req.body;

        // Check if category name already exists
        const existingCategory = await Category.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Validate parent category if provided
        if (parentCategory) {
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parent category ID'
                });
            }
        }

        const categoryData = {
            name: name.trim(),
            description: description?.trim(),
            parentCategory: parentCategory || null
        };

        // Handle uploaded image
        if (req.file) {
            categoryData.image = `/uploads/categories/${req.file.filename}`;
        }

        const category = new Category(categoryData);
        await category.save();

        // If this is a subcategory, add it to parent's subcategories array
        if (parentCategory) {
            await Category.findByIdAndUpdate(
                parentCategory,
                { $push: { subcategories: category._id } }
            );
        }

        await category.populate('parentCategory', 'name');

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category }
        });

    } catch (error) {
        console.error('Create category error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating category'
        });
    }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, parentCategory, isActive } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if new name conflicts with existing categories (excluding current)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                name: new RegExp(`^${name}$`, 'i'),
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Validate parent category if provided
        if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parent category ID'
                });
            }

            // Prevent circular reference
            if (parentCategory === id) {
                return res.status(400).json({
                    success: false,
                    message: 'Category cannot be its own parent'
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (parentCategory !== undefined) updateData.parentCategory = parentCategory || null;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Handle uploaded image
        if (req.file) {
            updateData.image = `/uploads/categories/${req.file.filename}`;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('parentCategory', 'name');

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: { category: updatedCategory }
        });

    } catch (error) {
        console.error('Update category error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating category'
        });
    }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has products
        const productCount = await Product.countDocuments({
            category: id,
            isActive: true
        });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${productCount} active products.`
            });
        }

        // Check if category has subcategories
        if (category.subcategories && category.subcategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category. It has subcategories.'
            });
        }

        // Remove from parent's subcategories array if it's a subcategory
        if (category.parentCategory) {
            await Category.findByIdAndUpdate(
                category.parentCategory,
                { $pull: { subcategories: id } }
            );
        }

        await Category.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category'
        });
    }
};

// Get category tree (hierarchical structure)
export const getCategoryTree = async (req, res) => {
    try {
        // Get all root categories (no parent)
        const rootCategories = await Category.find({
            parentCategory: null,
            isActive: true
        }).populate({
            path: 'subcategories',
            match: { isActive: true },
            populate: {
                path: 'subcategories',
                match: { isActive: true }
            }
        }).sort({ name: 1 });

        res.json({
            success: true,
            data: { categories: rootCategories }
        });

    } catch (error) {
        console.error('Get category tree error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category tree'
        });
    }
};
