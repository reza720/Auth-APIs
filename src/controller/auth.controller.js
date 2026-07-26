const authService= require("../services/auth.service");

// Signup controller
async function signup(req, res, next) {
    try{
        const user = await authService.signup(req.body);
        res.status(201).json({
            success: true, 
            message: "user signed up, please check your email to verify your account.", 
            user
        });
    }
    catch(err){
        next(err);
    }
};

// Verification email request
async function requestEmailVerification(req, res, next) {
    try{
        await authService.requestEmailVerification(req.body);
        res.status(200).json({
            success:true,
            message: "Verification email sent"
        });
    }
    catch(err){
        next(err);
    }
};

// Verify Email
async function verifyEmailToken(req, res, next) {
    try{
        const {token} = req.query;
        await authService.requestEmailVerification(token);
        res.status(200).json({
            success:true,
            message: "Email verified"
        });
    }
    catch(err){
        next(err);
    }
};

// Login
async function login(req, res, next) {
    try{
        const {accessToken, refreshToken} = await authService.login(req.body);
        
        res.cookie("refreshToken", refreshToken,{
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        
        res.status(200).json({
            success: true, 
            message: "user logged in",
            accessToken
        });
    }
    catch(err){
        next(err);
    }
};

// Refresh Access Token
async function refreshAccessToken(req, res, next) {
    try{
        const refreshToken = req.cookies.refreshToken;
        const {accessToken} = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({
            success:true,
            message: "Access token generated",
            accessToken
        });
    }
    catch(err){
        next(err);
    }
};

// Update Password
async function changePassword(req, res, next) {
    try{
        await authService.changePassword(
            req.user.id, 
            req.body.oldPassword, 
            req.body.newPassword);
        res.status(200).json({
            success: true,
            message: "Password changed"
        });
    }
    catch(err){
        next(err);
    }
};

// Update User Name
async function changeUserName(req, res, next) {
    try{
        await authService.changeUserName(
            req.user.id,
            req.body.newUserName
        );
        res.status(200).json({
            success: true, 
            message: "Username changed"
        });
    }
    catch(err){
        next(err);
    }
};

// Loutout
async function logout(req, res, next) {
    try{
        await authService.logout(req.cookies.refreshToken);
        res.status(200).json({
            success: true,
            message: "User logged out"
        });
    }
    catch(err){
        next(err);
    }
};

// Send pssword reset token link
async function sendPasswordResetToken(req, res, next) {
    try{
        await authService.sendPasswordResetToken(req.body);
        res.status(200).json({
            success: true,
            message: "Check your email for link to reset your password"
        });
    }
    catch(err){
        next(err);
    }
};

// Reset password
async function resetPassword(req, res, next) {
    try{
        const {token} = req.query;
        const {newPassword, confirmPassword} = req.body;
        await authService.resetPassword(token, newPassword, confirmPassword);
        
        res.status(200).json({
            success: true,
            message: "Password reset"
        });
    }
    catch(err){
        next(err);
    }
};

// User removal
async function deleteUser(req, res, next) {
    try{
        await authService.deleteUser(req.user.id);
        res.status(200).json({
            success: true,
            message: "User deleted"
        });
    }
    catch(err){
        next(err);
    }
};

// Get the User
async function getUser(req, res, next) {
    try{
        const user = await authService.getUser(req.user.id);
        res.status(200).json({
            success: true,
            user
        });
    }
    catch(err){
        next(err);
    }
};

module.exports = {
    signup,
    requestEmailVerification,
    verifyEmailToken,
    login,
    refreshAccessToken,
    changePassword,
    changeUserName,
    logout,
    sendPasswordResetToken,
    resetPassword,
    deleteUser,
    getUser
};
