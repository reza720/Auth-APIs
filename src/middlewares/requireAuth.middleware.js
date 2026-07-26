const jwt = require("jsonwebtoken");
const { env } = require("../config");
const throwError = require("../utils/throwError");

function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throwError("Authentication required", 401);
        }

        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(
            token,
            env.jwt.accessToken
        );

        req.user = {
            id: payload.id,
            userName: payload.userName,
            email: payload.email
        };
        next();
    }
    catch(err) {
        next(err);
    }
}

module.exports = requireAuth;