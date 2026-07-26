const express = require("express");
const helmet = require("helmet");

const globalErrorHandler = require("./middlewares/globalErrorHandler");
const rateLimiter = require("./config/rateLimiter.config");
const router = require("./router/auth.router");

const app = express();
app.use(helmet());
app.use(express.json());
app.use(rateLimiter.globalLimiter);

app.use("/api", router);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route Not found"
    });
});

app.use(globalErrorHandler);

module.exports = app;