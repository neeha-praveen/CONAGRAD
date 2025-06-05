const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No valid token provided.' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        req.user = { id: decoded.userId };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;