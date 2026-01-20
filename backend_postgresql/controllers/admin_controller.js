const { User, Product, Order } = require('../models');
const { Op } = require('sequelize');
const { handleError } = require('./error_handler.js');
/**
 * Controller to handle admin operations
 */
const adminController = {
    // Get high-level stats for the dashboard
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.count();
            // Korrigiert: Nutze das role Feld aus deinem Model
            const totalSellers = await User.count({ where: { role: 'seller' } });
            const totalProducts = await Product.count();
            const totalOrders = await Order.count();

            res.json({
                totalUsers,
                totalSellers,
                totalProducts,
                totalOrders
            });
        } catch (error) {
            await handleError(res, error, null, "get_dashboard_stats_failed");
        }
    },

    // Get all users (mit Paginierung)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                where: { role: 'user' },
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(users);
        } catch (error) {
            await handleError(res, error, null, "get_all_users_failed");
        }
    },

    // Get all sellers (Gefiltert aus der User Tabelle)
    getAllSellers: async (req, res) => {
        try {
            const sellers = await User.findAll({
                // Korrigiert: role statt isSeller
                where: { role: 'seller' },
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(sellers);
        } catch (error) {
            await handleError(res, error, null, "get_all_sellers_failed");
        }
    },
    // Get all products (JSONB Daten kommen automatisch mit)
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.findAll({
                order: [['createdAt', 'DESC']]
                // Images und Variants sind als JSONB bereits enthalten
            });
            res.json(products);
        } catch (error) {
            await handleError(res, error, null, "get_all_products_failed");
        }
    },

    // Get all orders
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
            res.json(orders);
        } catch (error) {
            await handleError(res, error, null, "get_all_orders_failed");
        }
    },

    // Toggle user active status
    toggleUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const user = await User.findByPk(id);
            if (!user) throw new Error("user_not_found");

            user.active = status;
            await user.save();
            res.json({ message: "success_update_status", active: user.active });
        } catch (err) {
            await handleError(res, err, null, "toggle_user_failed");
        }
    },

    // Da Seller nun User sind, kann toggleSeller die gleiche Logik wie toggleUser nutzen oder entfernt werden
    toggleSeller: async (req, res) => {
        // Gleiche Logik wie toggleUser, da Seller in der User Tabelle sind
        return adminController.toggleUser(req, res);
    }
};

module.exports = adminController;