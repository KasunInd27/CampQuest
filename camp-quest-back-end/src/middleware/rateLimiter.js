import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';

// Create MongoDB store only if MONGO_URI is available
const createMongoStore = (collectionName, expireTimeMs) => {
    if (process.env.MONGO_URI) {
        try {
            return new MongoStore({
                uri: process.env.MONGO_URI,
                collectionName,
                expireTimeMs
            });
        } catch (error) {
            console.warn(`Failed to create MongoDB store for ${collectionName}, falling back to memory store:`, error.message);
            return undefined;
        }
    }
    return undefined;
};

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use MongoDB to store rate limit data if available, otherwise use memory store
    store: createMongoStore('rate_limits', 15 * 60 * 1000)
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    store: createMongoStore('auth_rate_limits', 15 * 60 * 1000)
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createMongoStore('password_reset_limits', 60 * 60 * 1000)
});

// Email verification rate limiter
export const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 email verification requests per hour
    message: {
        success: false,
        message: 'Too many email verification attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createMongoStore('email_verification_limits', 60 * 60 * 1000)
});

// Account lockout middleware
export const checkAccountLockout = async (req, res, next) => {
    try {
        const { email } = req.body || {};
        
        if (!email) {
            return next();
        }
        
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (user && user.isLocked) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60)); // minutes
            return res.status(423).json({
                success: false,
                message: `Account is temporarily locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
                lockTimeRemaining
            });
        }
        
        next();
    } catch (error) {
        console.error('Account lockout check error:', error);
        next(); // Continue even if check fails
    }
};

// IP-based brute force protection
const failedAttempts = new Map();
const FAILED_ATTEMPTS_LIMIT = 10;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

export const ipBruteForceProtection = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean old entries
    for (const [ip, data] of failedAttempts.entries()) {
        if (now - data.lastAttempt > LOCKOUT_TIME) {
            failedAttempts.delete(ip);
        }
    }
    
    const ipData = failedAttempts.get(clientIP);
    
    if (ipData && ipData.attempts >= FAILED_ATTEMPTS_LIMIT) {
        const timeRemaining = Math.ceil((LOCKOUT_TIME - (now - ipData.lastAttempt)) / (1000 * 60));
        return res.status(429).json({
            success: false,
            message: `IP temporarily blocked due to too many failed attempts. Try again in ${timeRemaining} minutes.`,
            timeRemaining
        });
    }
    
    // Add middleware to track failed attempts
    req.trackFailedAttempt = () => {
        const current = failedAttempts.get(clientIP) || { attempts: 0, lastAttempt: now };
        current.attempts += 1;
        current.lastAttempt = now;
        failedAttempts.set(clientIP, current);
    };
    
    // Add middleware to reset failed attempts on success
    req.resetFailedAttempts = () => {
        failedAttempts.delete(clientIP);
    };
    
    next();
};
