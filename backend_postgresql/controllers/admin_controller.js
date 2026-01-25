const { User, Product, Order, UserProfileHistory, ProductStatusHistory, OrderStatusHistory, UserStats, sequelize } = require('../models');
const { Op } = require('sequelize');
const { handleError } = require('./error_handler.js');

/**
 * Controller to handle admin operations
 */
const adminController = {
    // ... existing stats and list methods ...
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.count();
            const totalSellers = await User.count({ where: { role: 'seller' } });
            const totalProducts = await Product.count();
            const totalOrders = await Order.count();
            const activeUsers = await User.count({
                where: {
                    updatedAt: { [Op.gt]: new Date(Date.now() - 5 * 60 * 1000) }
                }
            });

            res.json({
                totalUsers,
                totalSellers,
                totalProducts,
                totalOrders,
                activeUsers
            });
        } catch (error) {
            await handleError(res, error, null, "get_dashboard_stats_failed");
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                where: { role: 'user' },
                attributes: { exclude: ['password'] },
                include: [{ model: UserStats, as: 'stats', attributes: ['active'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(users);
        } catch (error) {
            await handleError(res, error, null, "get_all_users_failed");
        }
    },

    getAllSellers: async (req, res) => {
        try {
            const sellers = await User.findAll({
                where: { role: 'seller' },
                attributes: { exclude: ['password'] },
                include: [{ model: UserStats, as: 'stats', attributes: ['active'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(sellers);
        } catch (error) {
            await handleError(res, error, null, "get_all_sellers_failed");
        }
    },

    getAllProducts: async (req, res) => {
        try {
            const products = await Product.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json(products);
        } catch (error) {
            await handleError(res, error, null, "get_all_products_failed");
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.findAll({
                order: [['createdAt', 'DESC']],
                include: [
                    { model: User, as: 'buyer', attributes: ['id', 'firstName', 'lastName', 'email'] }
                ]
            });
            res.json(orders);
        } catch (error) {
            await handleError(res, error, null, "get_all_orders_failed");
        }
    },

    // Toggle user status (now supports ENUM strings)
    toggleUser: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { active } = req.body;

            const stats = await UserStats.findOne({ where: { userId: id } });
            if (!stats) throw new Error("stats_not_found");

            await stats.update({ active }, { transaction: t });

            // Record in history
            await UserProfileHistory.create({
                userId: id,
                changeType: 'status',
                newData: { status: active }
            }, { transaction: t });
            await t.commit();
            res.json({ message: "success_update_status", active: stats.active });
        } catch (err) {
            await handleError(res, err, null, "toggle_user_failed");
        }
    },

    toggleSeller: async (req, res) => {
        return adminController.toggleUser(req, res);
    },

    // Update product status/state
    updateProductStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const product = await Product.findByPk(id);
            if (!product) throw new Error("product_not_found");

            product.currentState = status;
            await product.save();

            // Record in history
            await ProductStatusHistory.create({
                productId: product.id,
                state: status,
                comment: `Updated by Admin`
            });

            res.json({ message: "success_update_status", status: product.currentState });
        } catch (error) {
            await handleError(res, error, null, "update_product_status_failed");
        }
    },

    // Update order status
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await Order.findByPk(id);
            if (!order) throw new Error("order_not_found");

            order.currentStatus = status;
            await order.save();

            // Record in history
            await OrderStatusHistory.create({
                orderId: order.id,
                status: status,
                comment: `Updated by Admin`
            });

            res.json({ message: "success_update_status", status: order.currentStatus });
        } catch (error) {
            await handleError(res, error, null, "update_order_status_failed");
        }
    }
};


module.exports = adminController;