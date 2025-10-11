const rateLimit = require("express-rate-limit");

// ✅ Limit login attempts — 5 requests / 1 min per IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { 
    error: "Too many login attempts, please try again later.",
    retryAfter: "1 minute"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from counting
  skipSuccessfulRequests: false,
  // Skip failed requests from counting  
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many login attempts from this IP, please try again after 1 minute.",
      retryAfter: 60
    });
  }
});

// ✅ Limit chat messages — 20 per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many messages. Please wait before sending again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ General API limiter — 100 requests / 10 mins per IP
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ Skip login/register routes from general API limit
  skip: (req) => {
    return req.path.includes('/login') || req.path.includes('/register');
  }
});

// ✅ Unified export (consistent)
module.exports = {
  loginLimiter,
  chatLimiter,
  apiLimiter
};