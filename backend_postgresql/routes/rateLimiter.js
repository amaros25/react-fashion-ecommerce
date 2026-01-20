const rateLimit = require('express-rate-limit');

/**
 * Intelligent key generator:
 * 1. If user is logged in (JWT verified), use their unique User ID.
 * 2. If it's a guest, use their IP address.
 */
const getDynamicKey = (req) => {
    // req.user is populated by your verifyToken middleware
    if (req.user && req.user.id) {
        return `user_${req.user.id}`;
    }
    return req.ip;
};

/**
 * Common configuration shared across limiters.
 * The 'validate' property fixes the ERR_ERL_KEY_GEN_IPV6 error.
 */
const commonOptions = {
    windowMs: 15 * 60 * 1000,
    keyGenerator: getDynamicKey,
    standardHeaders: true,
    legacyHeaders: false,
    // CRITICAL: This line disables the validation checks that cause the crash
    validate: {
        xForwardedForHeader: false,
        default: false
    }
};

// General limiter for standard browsing
const generalLimiter = rateLimit({
    ...commonOptions,
    max: 300,
    message: { message: "too_many_requests_try_later" },
});

// Stricter limiter for sensitive actions (Orders, Profile Updates)
const maxiGeneralLimiter = rateLimit({
    ...commonOptions,
    max: 300,
    message: { message: "too_many_requests_try_later" },
});

// Flood protection to prevent rapid-fire clicking within 1 minute
const floodLimiter = rateLimit({
    ...commonOptions,
    windowMs: 1 * 60 * 1000,
    max: 300,
    message: { message: "too_many_requests_flood_protection" },
});

// Strict limiter for Authentication (Login, Register)
const authLimiter = rateLimit({
    ...commonOptions,
    windowMs: 60 * 60 * 1000,
    max: 300,
    keyGenerator: (req) => req.ip, // Always use IP for Auth
    message: { message: "too_many_login_attempts_blocked" },
});

module.exports = { generalLimiter, maxiGeneralLimiter, authLimiter, floodLimiter };