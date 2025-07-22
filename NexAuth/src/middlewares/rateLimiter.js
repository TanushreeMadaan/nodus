const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false,  
  message: {
    status: 429,
    message: 'Too many requests. Please try again later.'
  },
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again after 10 minutes.'
  },
  skipSuccessfulRequests: true, // Only count failed attempts
});

module.exports = {
  generalLimiter,
  loginLimiter,
};
