const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { User, RefreshToken} = require("../models");
const { logger, env} = require("../config");
const emailService = require("./email.service");
const throwError = require("../utils/throwError");

// Register a new user
async function signup({userName, email, password, confirmPassword}){  
    if(password !== confirmPassword) throwError("Passwords do not match", 400);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        userName,
        email,
        password: hashedPassword
    });

    await requestEmailVerification(email);

    return { 
        id: user.id,
        userName: user.userName,
        email: user.email
    };
};

// Send email verification request
async function requestEmailVerification(email){ 
    const user = await User.findOne({
        where: {email}
    });
    if(!user) throwError("User not found", 404);
    if(user.isVerified) throwError ("Email is already verified", 400);

    const {token, hashedToken} = generateToken();
    await user.update({
        verificationToken: hashedToken,
        verificationTokenExpiresAt: new Date(Date.now() + 15*60*1000)
    });

    await emailService.sendAccountVerificationEmail(email, token); 
};

// Verify email 
async function  verifyEmailToken(token) { 
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        where: {verificationToken:hashedToken}
    });
    if(!user) throwError("Invalid token", 400);
    if(user.verificationTokenExpiresAt < new Date()) throwError("Token has expired", 400);

    await user.update({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null
    });
}

// Login 
async function login({email, password}) {
    const user = await User.findOne({
        where: {email}
    });
    
    if (!user) throwError(`User not found`, 404);
    const isPassValid = await bcrypt.compare(password, user.password);
    if(!isPassValid) throwError("Email or password is not correct", 401);
    if(!user.isVerified) throwError("Verify your email", 401);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const {exp} = jwt.verify(refreshToken, env.jwt.refreshSecret);

    await RefreshToken.create({
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(exp * 1000)
    });
    
    return { 
        accessToken,
        refreshToken
    }
}
async function refreshAccessToken(refreshToken) {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const storedToken = await RefreshToken.findOne({
        where: {
            tokenHash,
            revokedAt: null,
        },
    });

    if (!storedToken) throwError("Invalid Refresh Token", 401);
    if (storedToken.expiresAt < new Date()) throwError("Refresh Token has expired", 401);

    const payload = jwt.verify(
        refreshToken,
        env.jwt.refreshSecret
    );
    const user = await User.findByPk(payload.id);
    if (!user) throwError("User not found", 404);

    const accessToken = generateAccessToken(user);
    return {accessToken};
}

// Update password
async function changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if(!user) throwError("User not found", 404);

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if(!isOldPasswordValid) throwError("Invalid password", 401);

    const newPasswordHashed = await bcrypt.hash(newPassword, 10);

    await user.update({
        password:newPasswordHashed
    });
};

// Update User Name
async function changeUserName(userId, newUserName) {
    const user = await User.findByPk(userId);

    if(!user) throwError("User not found", 404);

    await user.update({
        userName: newUserName
    });
};

// Logout
async function logout(refreshToken) {
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const storedToken = await RefreshToken.findOne({
        where:{
            tokenHash: hashedToken,
            revokedAt: null
        }
    });
    
    if(!storedToken) throwError("Invalid refresh token", 401);

    await storedToken.update({
        revokedAt: new Date()
    });
};

// Handle forgot password and reset it
async function sendPasswordResetToken(email) {  
    const user = await User.findOne({
        where:{email}
    });
    if (!user) throwError("Email is wrong", 400); 
    const {token, hashedToken} = generateToken();
    await user.update({
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await emailService.sendPasswordResetEmail(email, token);
};

async function resetPassword(token, newPassword, confirmPassword) {
    if(newPassword !== confirmPassword) throwError("Passwords do not match", 400);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        where:{resetPasswordToken: hashedToken}
    });
    
    if(!user) throwError("Invalid token", 401);
    if(user.resetPasswordTokenExpiresAt < new Date()) throwError("Token has expired", 401);

    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    await user.update({
        password: newPasswordHashed,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null
    });
    await RefreshToken.destroy({
        where: {userId: user.id}
    });
};

// Delete user account
async function deleteUser(userId) {
    const user = await User.findByPk(userId);

    if(!user) throwError("User not found", 404);

    await RefreshToken.destroy({
        where:{userId:user.id}
    });
    await user.destroy();
};

// User Retrieval
async function getUser(userId) {
    const user = await User.findByPk(userId);
    if(!user) throwError("User not found", 404);

    return {
        id: user.id,
        userName: user.userName,
        email: user.email
    };
}



// Utility Functions

// Generates secure tokens for email verification and reset password
function generateToken(){
    const token = crypto.randomBytes(16).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return {
        token,
        hashedToken
    }
};

// Generates JWT access tokens
function generateAccessToken(user){
    return jwt.sign(
        {
            id:user.id,
            userName: user.userName,
            email: user.email
        },
        env.jwt.accessToken,
        {
            expiresIn: env.jwt.accessSecretExpiresAt
        }
    );
}

// Generates JWT refresh tokens
function generateRefreshToken(user){
    return jwt.sign(
        {
            id:user.id
        },
        env.jwt.refreshSecret,
        {
            expiresIn: env.jwt.refreshSecretExpiresAt
        }
    );
}

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


