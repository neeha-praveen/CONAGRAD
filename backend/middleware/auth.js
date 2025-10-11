const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No valid token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    req.user = { id: decoded.userId, userType: decoded.userType };
    
    next();
  } catch (error) {
    // ✅ Only log in development, not production
    if (process.env.NODE_ENV !== "production") {
      console.error('Auth middleware error:', error.name, '-', error.message);
    }

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        error: 'Token not active yet',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    // Generic error
    return res.status(401).json({ 
      error: 'Invalid token.',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = authMiddleware;