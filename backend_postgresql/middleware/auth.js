const jwt = require("jsonwebtoken");
const { User } = require('../models');
require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
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
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.body.id;
        if (!userId) throw new Error("unauthorized_no_token");
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("seller_not_found");
        }
        if (user.role !== "admin") {
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
        const userId = req.user?.id || req.body.id;
        if (!userId) throw new Error("unauthorized_no_token");
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("seller_not_found");
        }
        // if (user.role !== "seller") {
        //     throw new Error("forbidden_seller_only");
        // }
        const forbiddenStates = {
            "pending": "seller_pending",
            "banned": "seller_banned",
            "deleted": "seller_deleted",
            "unverified": "seller_unverified"
        };
        if (forbiddenStates[user.active]) {
            throw new Error(forbiddenStates[user.active]);
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

const verifyUserSecure = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("user_not_found");
        }
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
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("user_not_found");
        }
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

module.exports = { verifyToken, verifyAdmin, verifySellerSecure, verifyUserSecure, verifyGlobalUserActions };
