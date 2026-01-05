const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "DEIN_SECRET_KEY";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "unauthorized_no_token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains id and role
        next();
    } catch (err) {
        return res.status(401).json({ message: "unauthorized_invalid_token" });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "forbidden_admin_only" });
    }
};

const verifySeller = (req, res, next) => {
    if (req.user && (req.user.role === "seller" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403).json({ message: "forbidden_seller_only" });
    }
};

module.exports = { verifyToken, verifyAdmin, verifySeller };
