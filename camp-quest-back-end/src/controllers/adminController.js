import User from '../models/UserManagement/User.js';
import { extractUserInfo } from '../middleware/auth.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            isActive,
            isEmailVerified,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isEmailVerified !== undefined) filter.isEmailVerified = isEmailVerified === 'true';
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const users = await User.find(filter)
            .select('-password -previousPasswords -emailVerificationToken -passwordResetToken -twoFactorSecret -refreshTokens')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        // Get total count for pagination
        const total = await User.countDocuments(filter);

        // Get user statistics
        const stats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
                    verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    customerUsers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
                    moderatorUsers: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalUsers: total,
                    hasNext: skip + users.length < total,
                    hasPrev: Number(page) > 1
                },
                stats: stats[0] || {
                    totalUsers: 0,
                    activeUsers: 0,
                    verifiedUsers: 0,
                    adminUsers: 0,
                    customerUsers: 0,
                    moderatorUsers: 0
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .select('-password -previousPasswords -emailVerificationToken -passwordResetToken -twoFactorSecret -refreshTokens')
            .populate('wishlist', 'name images pricing')
            .populate('rentals', 'orderNumber status type createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user'
        });
    }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, isActive, isEmailVerified, address } = req.body;
        const { userAgent, ipAddress } = extractUserInfo(req);

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deactivating themselves
        if (id === req.user._id.toString() && isActive === false) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        // Prevent admin from changing their own role
        if (id === req.user._id.toString() && role && role !== user.role) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: id }
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update user fields
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) {
            updateData.email = email.toLowerCase().trim();
            // If email is changed, mark as unverified
            if (email !== user.email) {
                updateData.isEmailVerified = false;
            }
        }
        if (phone) updateData.phone = phone.trim();
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;
        if (address) updateData.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -previousPasswords -emailVerificationToken -passwordResetToken -twoFactorSecret -refreshTokens');

        // Log activity
        updatedUser.logActivity('profile_update', ipAddress, userAgent, `Profile updated by admin: ${req.user.name}`);
        await updatedUser.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Update user error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating user'
        });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has active orders/rentals
        const Order = (await import('../models/Order.js')).default;
        const activeOrders = await Order.countDocuments({
            customer: id,
            status: { $in: ['pending', 'confirmed', 'processing', 'shipped', 'active'] }
        });

        if (activeOrders > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user with ${activeOrders} active orders. Please complete or cancel orders first.`
            });
        }

        // Soft delete by deactivating the account
        user.isActive = false;
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();

        res.json({
            success: true,
            message: 'User account deactivated successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user'
        });
    }
};

// Get user activity log (Admin only)
export const getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get paginated activity log
        const skip = (Number(page) - 1) * Number(limit);
        const activities = user.activityLog
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(skip, skip + Number(limit));

        const total = user.activityLog.length;

        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalActivities: total,
                    hasNext: skip + activities.length < total,
                    hasPrev: Number(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user activity'
        });
    }
};

// Unlock user account (Admin only)
export const unlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAgent, ipAddress } = extractUserInfo(req);

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isLocked) {
            return res.status(400).json({
                success: false,
                message: 'User account is not locked'
            });
        }

        // Reset login attempts and unlock
        await user.resetLoginAttempts();
        
        // Log activity
        user.logActivity('account_unlock', ipAddress, userAgent, `Account unlocked by admin: ${req.user.name}`);
        await user.save();

        res.json({
            success: true,
            message: 'User account unlocked successfully'
        });

    } catch (error) {
        console.error('Unlock user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while unlocking user account'
        });
    }
};

// Force logout user from all devices (Admin only)
export const forceLogoutUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAgent, ipAddress } = extractUserInfo(req);

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove all refresh tokens
        user.removeAllRefreshTokens();
        
        // Log activity
        user.logActivity('forced_logout', ipAddress, userAgent, `Forced logout by admin: ${req.user.name}`);
        await user.save();

        // Blacklist all tokens for this user
        const TokenBlacklist = (await import('../models/TokenBlacklist.js')).default;
        await TokenBlacklist.blacklistAllUserTokens(id, 'admin_logout');

        res.json({
            success: true,
            message: 'User logged out from all devices successfully'
        });

    } catch (error) {
        console.error('Force logout user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while logging out user'
        });
    }
};
