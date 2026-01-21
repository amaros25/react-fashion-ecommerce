const jwt = require("jsonwebtoken");
const { User } = require('../models');
require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

const optionalHeartbeat = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            if (user) {
                const FOUR_MINUTES = 240000;
                if (Date.now() - new Date(user.updatedAt).getTime() > FOUR_MINUTES) {
                    user.changed('updatedAt', true);
                    await user.save();
                }
                req.user = user;
            }
        } catch (error) {
            console.log("Optional heartbeat failed:", error.message);
        }
    }
    next();
};

const verifyToken = async (req, res, next) => {
    if (req.user) return next();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "unauthorized_no_token" });
    }
    if (!JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined.");
        process.exit(1);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch user and update timestamp if more than 1 hour ago
        const user = await User.findByPk(decoded.id);
        if (user) {
            const FOUR_MINUTES = 240000;
            if (Date.now() - new Date(user.updatedAt).getTime() > FOUR_MINUTES) {
                user.changed('updatedAt', true);
                await user.save();
            }
            req.user = user; // Attach full user object for subsequent middleware reuse
        } else {
            return res.status(404).json({ message: "user_not_found" });
        }

        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

const verifyAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            const userId = req.body.id;
            if (!userId) throw new Error("unauthorized_no_token");
            const dbUser = await User.findByPk(userId);
            if (!dbUser) throw new Error("seller_not_found");
            if (dbUser.role !== "admin") throw new Error("forbidden_admin_only");
        } else if (user.role !== "admin") {
            throw new Error("forbidden_admin_only");
        }
        next();
    } catch (error) {
        console.log("server error: ", error.message);
        return res.status(403).json({ message: error.message });
    }
};

const verifySellerSecure = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            const userId = req.body.id;
            if (!userId) throw new Error("unauthorized_no_token");
            const dbUser = await User.findByPk(userId);
            if (!dbUser) throw new Error("seller_not_found");
            req.user = dbUser; // Provision for further checks
        }

        const activeUser = req.user;
        const forbiddenStates = {
            "pending": "seller_pending",
            "banned": "seller_banned",
            "deleted": "seller_deleted",
            "unverified": "seller_unverified"
        };
        if (forbiddenStates[activeUser.active]) {
            throw new Error(forbiddenStates[activeUser.active]);
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

const verifyUserSecure = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) throw new Error("user_not_found");

        if (user.role !== "user") {
            throw new Error("forbidden_user_only");
        }
        const forbiddenStates = {
            "pending": "user_pending",
            "banned": "user_banned",
            "deleted": "user_deleted",
            "unverified": "user_unverified"
        };
        if (forbiddenStates[user.active]) {
            throw new Error(forbiddenStates[user.active]);
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

const verifyGlobalUserActions = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) throw new Error("user_not_found");

        const forbiddenStates = {
            "banned": "user_banned",
            "deleted": "user_deleted",
            "unverified": "user_unverified"
        };
        if (forbiddenStates[user.active]) {
            throw new Error(forbiddenStates[user.active]);
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

module.exports = {
    optionalHeartbeat,
    verifyToken,
    verifyAdmin,
    verifySellerSecure,
    verifyUserSecure,
    verifyGlobalUserActions
};
