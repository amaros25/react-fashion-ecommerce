const { User, Product, Order } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller to handle admin operations
 */
const adminController = {
    // Get high-level stats for the dashboard
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.count();
            // Wenn Seller jetzt User mit einer speziellen Rolle sind:
            const totalSellers = await User.count({ where: { isSeller: true } });
            const totalProducts = await Product.count();
            const totalOrders = await Order.count();

            res.json({
                totalUsers,
                totalSellers,
                totalProducts,
                totalOrders
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    },

    // Get all users (mit Paginierung)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(users);
        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    },

    // Get all sellers (Gefiltert aus der User Tabelle)
    getAllSellers: async (req, res) => {
        try {
            const sellers = await User.findAll({
                where: { isSeller: true }, // Filtert nur die Verkäufer heraus
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(sellers);
        } catch (error) {
            console.error('Error fetching all sellers:', error);
            res.status(500).json({ error: 'Failed to fetch sellers' });
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
            console.error('Error fetching all products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    // Get all orders
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
            res.json(orders);
        } catch (error) {
            console.error('Error fetching all orders:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    },

    // Toggle user active status
    toggleUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: "user_not_found" });

            user.active = req.body.active;
            await user.save();
            res.json({ message: "success_update_status", active: user.active });
        } catch (err) {
            console.error('Error toggling user:', err);
            res.status(500).json({ message: "server_error" });
        }
    },

    // Da Seller nun User sind, kann toggleSeller die gleiche Logik wie toggleUser nutzen oder entfernt werden
    toggleSeller: async (req, res) => {
        // Gleiche Logik wie toggleUser, da Seller in der User Tabelle sind
        return adminController.toggleUser(req, res);
    }
};

module.exports = adminController;