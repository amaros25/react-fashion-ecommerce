const User = require("../models/user");
const Seller = require("../models/seller");
const Product = require("../models/product");
const Order = require("../models/order");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSellers = await Seller.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const openOrders = await Order.countDocuments({
            "status.update": { $nin: [3, 4, 13, 30, 31, 42] } // Exclude finalized statuses (Delivered, PickedUp, Failed, Cancelled)
            // Note: This logic assumes status array last element check is needed, but countDocuments on simple query might not be enough for array.
            // Simplified for now, or better:
        });

        // Better open orders logic: (Last status is NOT "final")
        // Since status is an array, we might need aggregation or fetch all.
        // For performance, let's keep it simple or use aggregation if needed.
        // Let's use a simple approximation provided by countDocuments if possible, or skip openOrders count if too complex for this step.
        // Actually, let's just send the totals for now.

        res.json({
            totalUsers,
            totalSellers,
            totalProducts,
            totalOrders
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllSellers = async (req, res) => {
    try {
        const sellers = await Seller.find().select("-password").sort({ createdAt: -1 });
        res.json(sellers);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        console.log("Admin: Getting all products...");
        const products = await Product.find().sort({ createdAt: -1 });
        // Removed populate for now to test if that's causing issues
        console.log(`Admin: Found ${products.length} products`);
        res.json(products);
    } catch (err) {
        console.error("Admin Product Error:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        console.log("Admin: Getting all orders...");
        const orders = await Order.find().sort({ createdAt: -1 });
        console.log(`Admin: Found ${orders.length} orders`);
        res.json(orders);
    } catch (err) {
        console.error("Admin Order Error:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

exports.toggleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.active = req.body.active;
        await user.save();
        res.json({ message: "User active status updated", active: user.active });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.toggleSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ message: "Seller not found" });

        seller.active = req.body.active;
        await seller.save();
        res.json({ message: "Seller active status updated", active: seller.active });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
