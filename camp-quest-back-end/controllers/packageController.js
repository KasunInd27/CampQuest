import SpecialPackage from '../models/SpecialPackage.js';
import mongoose from 'mongoose';

// Create new package
export const createPackage = async (req, res) => {
    try {
        const { name, description, price, includes, imageUrl, isActive } = req.body;

        const newPackage = new SpecialPackage({
            name,
            description,
            price,
            includes: Array.isArray(includes) ? includes : includes?.split(',').map(i => i.trim()),
            imageUrl,
            isActive: isActive !== undefined ? isActive : true
        });

        await newPackage.save();

        res.status(201).json({
            success: true,
            data: newPackage,
            message: 'Package created successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Package name already exists'
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all packages (admin sees all, public sees active)
export const getPackages = async (req, res) => {
    try {
        const isAdmin = req.user && req.user.role === 'admin';
        const query = isAdmin ? {} : { isActive: true };

        // Sort by newest first
        const packages = await SpecialPackage.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single package by ID
export const getPackage = async (req, res) => {
    try {
        const { id } = req.params;

        let pkg;
        if (mongoose.Types.ObjectId.isValid(id)) {
            pkg = await SpecialPackage.findById(id);
        } else {
            // Fallback search by slug
            pkg = await SpecialPackage.findOne({ slug: id });
        }

        if (!pkg) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.json({
            success: true,
            data: pkg
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update package
export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, includes, imageUrl, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: 'Invalid package ID'
            });
        }

        const updateData = {
            name,
            description,
            price,
            // If includes is sent, ensure it's array
            ...(includes && { includes: Array.isArray(includes) ? includes : includes.split(',').map(i => i.trim()) }),
            imageUrl,
            isActive
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedPackage = await SpecialPackage.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Force regenerate slug if name changed
        if (name && name !== updatedPackage.name) {
            updatedPackage.slug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            await updatedPackage.save();
        }


        res.json({
            success: true,
            data: updatedPackage,
            message: 'Package updated successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Package name already exists'
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete package
export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: 'Invalid package ID'
            });
        }

        const deletedPackage = await SpecialPackage.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.json({
            success: true,
            message: 'Package deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
