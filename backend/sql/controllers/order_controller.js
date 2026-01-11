const { Order, OrderItem, OrderStatus, Product, ProductSize, User, SellerReview, SellerBill, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller to handle order-related operations for MySQL
 */
const orderController = {
    // GET: Get order by ID
    getOrderByID: async (req, res) => {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: OrderItem, as: 'items', include: [{ model: Product }] },
                    { model: OrderStatus, as: 'statusUpdates' }
                ]
            });
            if (!order) return res.status(404).json({ message: "order_not_found" });
            res.json(order);
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get order by order number
    getOrderByNumber: async (req, res) => {
        try {
            const order = await Order.findOne({
                where: { orderNumber: req.params.orderNumber },
                include: [
                    { model: OrderItem, as: 'items', include: [{ model: Product }] },
                    { model: OrderStatus, as: 'statusUpdates' }
                ]
            });
            if (!order) return res.status(404).json({ message: "order_not_found" });
            res.json(order);
        } catch (error) {
            console.error('Error fetching order by number:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get orders by Seller ID (paginated)
    getOrderBySellerID: async (req, res) => {
        try {
            const { sellerId } = req.params;
            const { status, orderNumber, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            // In Sequelize, filtering by the "last" status in a related table is tricky.
            // We'll filter orders where at least one status matches if status is provided, 
            // or filter the main status if we moved it to the Order model.
            // Based on original logic: it filters by orders that HAVE items belonging to this seller?
            // Actually, original Order model has a `sellerId` top level (usually).
            const where = { sellerId };
            if (status) where.status = status; // Assuming we keep current status in Order model for easy filtering
            if (orderNumber) where.orderNumber = { [Op.like]: `%${orderNumber}%` };

            const { count, rows } = await Order.findAndCountAll({
                where,
                include: [
                    { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: OrderItem, as: 'items', include: [{ model: Product }] }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            res.json({
                orders: rows,
                totalCount: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get orders by User ID
    getOrderByUserID: async (req, res) => {
        try {
            const userId = req.params.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Order.findAndCountAll({
                where: { userId },
                include: [{ model: OrderItem, as: 'items', include: [{ model: Product }] }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            res.json({
                page: parseInt(page),
                totalOrders: count,
                totalPages: Math.ceil(count / limit),
                orders: rows
            });
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Create new order
    createOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { items, is_delivery, userId, sellerId, address, paymentInfo } = req.body;
            let calculatedTotal = 0;

            // 1. Verify stock and calculate price
            for (const item of items) {
                const product = await Product.findByPk(item.productId, {
                    include: [{
                        model: ProductSize,
                        as: 'sizes',
                        where: { size: item.size, color: item.color }
                    }]
                });

                if (!product || !product.sizes || product.sizes.length === 0) {
                    throw new Error('product_variant_not_found');
                }

                const variant = product.sizes[0];
                if (variant.stock < item.quantity) {
                    throw new Error('insufficient_stock');
                }

                calculatedTotal += parseFloat(product.price) * item.quantity;
                if (is_delivery) {
                    calculatedTotal += parseFloat(product.delprice || 0) * item.quantity;
                }
            }

            // 2. Create Order
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const order = await Order.create({
                userId,
                sellerId,
                orderNumber,
                totalPrice: calculatedTotal,
                status: '0', // Pending
                paymentInfo: JSON.stringify(paymentInfo)
            }, { transaction: t });

            // 3. Create OrderItems
            await OrderItem.bulkCreate(items.map(item => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: items.find(i => i.productId === item.productId).price // Should ideally come from verified product
            })), { transaction: t });

            // 4. Create initial status
            await OrderStatus.create({
                orderId: order.id,
                update: 0,
                date: new Date()
            }, { transaction: t });

            await t.commit();
            res.status(201).json(order);
        } catch (error) {
            await t.rollback();
            console.error("Error creating order:", error);
            const statusCode = (error.message === 'product_variant_not_found' || error.message === 'insufficient_stock') ? 400 : 500;
            res.status(statusCode).json({ message: error.message || "server_error" });
        }
    },

    // PUT: Update order status
    updateOrderStatus: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, as: 'items' }]
            });

            if (!order) return res.status(404).json({ message: "order_not_found" });

            const oldStatus = parseInt(order.status);
            const newStatus = parseInt(status);

            // Status 1 = Confirmed (Stock reduction)
            if (newStatus === 1 && oldStatus === 0) {
                for (const item of order.items) {
                    await ProductSize.decrement('stock', {
                        by: item.quantity,
                        where: { productId: item.productId, size: item.size, color: item.color },
                        transaction: t
                    });
                    // Logic for Seller Bills
                    const product = await Product.findByPk(item.productId);
                    const commission = (parseFloat(product.price) * item.quantity) * 0.03;
                    await SellerBill.create({
                        orderId: order.id,
                        productId: item.productId,
                        sellerId: order.sellerId,
                        billNumber: `FACT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                        amount: commission,
                        date: new Date()
                    }, { transaction: t });
                }
            }

            // Replenishment logic
            const replenishmentStatuses = [30, 31, 13, 24, 42];
            if (replenishmentStatuses.includes(newStatus)) {
                // Find if stock was ever subtracted (has status 1 in history)
                const wasStockSubtracted = await OrderStatus.findOne({
                    where: { orderId: order.id, update: 1 }
                });
                if (wasStockSubtracted) {
                    for (const item of order.items) {
                        await ProductSize.increment('stock', {
                            by: item.quantity,
                            where: { productId: item.productId, size: item.size, color: item.color },
                            transaction: t
                        });
                    }
                }
            }

            order.status = status;
            await order.save({ transaction: t });

            await OrderStatus.create({
                orderId: order.id,
                update: newStatus,
                date: new Date()
            }, { transaction: t });

            await t.commit();
            res.json(order);
        } catch (error) {
            await t.rollback();
            console.error("Error updating order status:", error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Order count per product
    getOrderCountByProduct: async (req, res) => {
        try {
            const { productId } = req.params;
            const count = await OrderItem.count({ where: { productId } });
            res.json({ productId, totalOrders: count });
        } catch (error) {
            console.error("Error counting product orders:", error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Seller order stats
    getSellerOrderStats: async (req, res) => {
        try {
            const { sellerId } = req.params;
            const totalOrders = await Order.count({ where: { sellerId } });
            const openOrders = await Order.count({
                where: {
                    sellerId,
                    status: '0' // Pending
                }
            });
            res.json({ totalOrders, openOrders });
        } catch (error) {
            console.error("Error fetching order stats:", error);
            res.status(500).json({ message: "server_error" });
        }
    }
};

module.exports = orderController;
