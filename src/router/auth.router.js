const authController = require("../controller/auth.controller");
const requireAuth = require("../middlewares/requireAuth.middleware");
const rateLimter = require("../config/rateLimiter.config");

const express = require("express");
const router = express.Router();

// Signup
router.post("/auth/signup", rateLimter.signupLimiter, authController.signup);

// Email verification
router.post("/auth/verification-request-email", rateLimter.emailVerificationRequestLimiter,authController.requestEmailVerification);  
router.get("/auth/verify-email", authController.verifyEmailToken);         

// Login 
router.post("/auth/login", rateLimter.loginLimiter,authController.login);               
router.post("/auth/refresh-token", authController.refreshAccessToken);            
router.delete("/auth/logout", authController.logout);            

// Account updates
router.patch("/auth/change-password", requireAuth, authController.changePassword);                     
router.patch("/auth/change-username", requireAuth, authController.changeUserName);           

// Password recovery
router.post("/auth/password/forgot-password", rateLimter.passwordResetRequestLimiter,authController.sendPasswordResetToken);     
router.post("/auth/password/reset-password", authController.resetPassword);          

// User profile
router.get("/auth/me", requireAuth, authController.getUser);                   
router.delete("/auth/me", requireAuth, authController.deleteUser);    

module.exports = router;
