import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['logout', 'logout_all', 'password_change', 'account_deactivation'],
        default: 'logout'
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // MongoDB TTL index
    }
}, {
    timestamps: true
});

// Index for better performance
tokenBlacklistSchema.index({ token: 1 });
tokenBlacklistSchema.index({ userId: 1 });

// Static method to blacklist a token
tokenBlacklistSchema.statics.blacklistToken = async function(token, userId, reason = 'logout', expiresAt) {
    try {
        await this.create({
            token,
            userId,
            reason,
            expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
        });
        return true;
    } catch (error) {
        console.error('Error blacklisting token:', error);
        return false;
    }
};

// Static method to check if token is blacklisted
tokenBlacklistSchema.statics.isTokenBlacklisted = async function(token) {
    try {
        const blacklistedToken = await this.findOne({ token });
        return !!blacklistedToken;
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return false;
    }
};

// Static method to blacklist all tokens for a user
tokenBlacklistSchema.statics.blacklistAllUserTokens = async function(userId, reason = 'logout_all') {
    try {
        // This would typically be used when we want to invalidate all tokens for a user
        // We'll store a special entry that can be checked against
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await this.create({
            token: `user_${userId}_all_${Date.now()}`,
            userId,
            reason,
            expiresAt
        });
        
        return true;
    } catch (error) {
        console.error('Error blacklisting all user tokens:', error);
        return false;
    }
};

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;
