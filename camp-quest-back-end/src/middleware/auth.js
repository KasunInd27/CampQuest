import jwt from 'jsonwebtoken';
import User from '../models/UserManagement/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';

// Generate JWT token with remember me option
export const generateToken = (userId, rememberMe = false) => {
    const expiresIn = rememberMe ? '30d' : '7d';
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn
    });
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', {
        expiresIn: '30d'
    });
};

// Verify JWT token middleware
export const authenticate = async (req, res, next) => {
    try {
        // Check for token in cookies first (for new structure), then in Authorization header (for compatibility)
        const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check if token is blacklisted
        const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token has been invalidated. Please login again.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address to access this resource.'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
            return res.status(423).json({
                success: false,
                message: `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.`
            });
        }

        req.user = user;
        req.userId = user._id; // For compatibility with sample structure
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Admin authorization middleware (backward compatibility)
export const authorizeAdmin = authorize('admin');

// Moderator or Admin authorization
export const authorizeModerator = authorize('admin', 'moderator');

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            // Check if token is blacklisted
            const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(token);
            if (!isBlacklisted) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const user = await User.findById(decoded.userId).select('-password');
                
                if (user && user.isActive && user.isEmailVerified && !user.isLocked) {
                    req.user = user;
                    req.token = token;
                }
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

// Middleware to extract user info from request
export const extractUserInfo = (req) => {
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    return { userAgent, ipAddress };
};
