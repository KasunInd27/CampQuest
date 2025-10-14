// middleware/userIdentifier.js
import crypto from 'crypto';

export const getUserIdentifier = (req, res, next) => {
  try {
    // Get IP address with multiple fallbacks
    let ipAddress = req.ip || 
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    req.connection?.remoteAddress ||
                    req.socket?.remoteAddress ||
                    req.headers['x-real-ip'] ||
                    'unknown';

    // Clean IPv6 localhost to IPv4
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1';
    }

    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Create a unique identifier based on IP and User Agent
    const identifier = crypto
      .createHash('sha256')
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex');
    
    req.userIdentifier = identifier;
    req.ipAddress = ipAddress;
    req.userAgent = userAgent;
    
    console.log('User Identifier Created:', {
      identifier: identifier.substring(0, 10) + '...',
      ip: ipAddress,
      agent: userAgent.substring(0, 50)
    });
    
    next();
  } catch (error) {
    console.error('Error in getUserIdentifier middleware:', error);
    next(error);
  }
};