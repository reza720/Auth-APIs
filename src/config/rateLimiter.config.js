const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, try later"
    }
});
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Try after 10 minutes"
    }
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Try after an hour"
    }
});

const passwordResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Try after an hour"
    }
});

const emailVerificationRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Try after an hour"
    }
});

module.exports = {
    globalLimiter,
    loginLimiter,
    signupLimiter,
    passwordResetRequestLimiter,
    emailVerificationRequestLimiter
};
