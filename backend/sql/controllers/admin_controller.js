const { User, Seller, Product, Order } = require('../models');

/**
 * Controller to handle admin operations for MySQL
 */
const adminController = {
    // Get high-level stats for the dashboard
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.count();
            const totalSellers = await Seller.count();
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

    // Get all users
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

    // Get all sellers
    getAllSellers: async (req, res) => {
        try {
            const sellers = await Seller.findAll({
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(sellers);
        } catch (error) {
            console.error('Error fetching all sellers:', error);
            res.status(500).json({ error: 'Failed to fetch sellers' });
        }
    },

    // Get all products
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
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

    // Toggle seller active status
    toggleSeller: async (req, res) => {
        try {
            const seller = await Seller.findByPk(req.params.id);
            if (!seller) return res.status(404).json({ message: "seller_not_found" });

            seller.active = req.body.active;
            await seller.save();
            res.json({ message: "success_update_status", active: seller.active });
        } catch (err) {
            console.error('Error toggling seller:', err);
            res.status(500).json({ message: "server_error" });
        }
    }
};

module.exports = adminController;
