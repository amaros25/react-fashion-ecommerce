const { Order, Product, UserStats, User, SellerBill, OrderStatusHistory, OrderItem, ProductVariant, ProductReview, UserReview, sequelize } = require('../models');
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
                    { model: User, as: 'buyer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: OrderItem, as: 'items', include: [{ model: ProductVariant, as: 'variant' }] },
                    { model: OrderStatusHistory, as: 'statusHistory' }
                ],
                order: [
                    [{ model: OrderStatusHistory, as: 'statusHistory' }, 'createdAt', 'DESC']
                ]
            });

            if (!order) {
                return res.status(404).json({ message: "order_not_found_get_order_by_id" });
            }
            res.json(order);
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            res.status(500).json({ message: "server_error_get_order_by_id" });
        }
    },
    // GET: Get order by order number
    getOrderByNumber: async (req, res) => {
        try {
            const { orderNumber } = req.params;

            const order = await Order.findOne({
                where: { orderNumber: orderNumber },
                include: [
                    { model: User, as: 'buyer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: OrderStatusHistory, as: 'statusHistory' },
                    {
                        model: OrderItem, as: 'items',
                        include: [
                            { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
                            { model: ProductVariant, as: 'variant', attributes: ['id', 'size', 'color'] }
                        ]
                    },
                ],
                order: [
                    [{ model: OrderStatusHistory, as: 'statusHistory' }, 'createdAt', 'DESC']
                ]
            });

            if (!order) {
                return res.status(404).json({ message: "order_not_found" });
            }

            res.json(order);
        } catch (error) {
            console.error('Error fetching order by number:', error);
            res.status(500).json({ message: "server_error_get_order_by_number" });
        }
    },

    // GET: Get orders by Seller ID (paginated)
    getOrderBySellerID: async (req, res) => {
        try {
            const { sellerId } = req.params;
            const { status, orderNumber, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            const where = { sellerId };
            if (status) { where.currentStatus = status; }
            if (orderNumber) { where.orderNumber = { [Op.like]: `%${orderNumber}%` }; }

            const { count, rows } = await Order.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true,
                include: [
                    { model: OrderStatusHistory, as: 'statusHistory', attributes: ['status', 'comment', 'createdAt'] },
                    {
                        model: OrderItem, as: 'items',
                        include: [
                            {
                                model: Product, as: 'product', attributes: [
                                    'id',
                                    'name',
                                    [sequelize.literal(`"items->product" . "images" ->> 0`), 'mainImage'],
                                    'price',
                                    'delprice']
                            },
                            { model: ProductVariant, as: 'variant', attributes: ['id', 'size', 'color'] }
                        ]
                    },
                    { model: User, as: 'buyer', attributes: ['firstName', 'lastName'] }
                ],
                // Dies stellt sicher, dass die History innerhalb der Order sortiert ist
                order: [
                    ['createdAt', 'DESC'],
                    [{ model: OrderStatusHistory, as: 'statusHistory' }, 'createdAt', 'DESC']
                ],
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Order.findAndCountAll({
                where: { userId },
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']],
                distinct: true,
                include: [
                    {
                        model: User,
                        as: 'seller',
                        attributes: ['id', 'shopName', 'imageUrl']
                    },
                    {
                        model: UserReview,
                        as: 'sellerReview',
                        where: { senderId: userId },
                        required: false,
                        attributes: ['id', 'rating']
                    },
                    { model: OrderStatusHistory, as: 'statusHistory', attributes: ['status', 'comment', 'createdAt'] },
                    {
                        model: OrderItem, as: 'items',
                        include: [
                            {
                                model: Product, as: 'product',
                                attributes: [
                                    'id',
                                    'name',
                                    [sequelize.literal(`"items->product" . "images" ->> 0`), 'mainImage'],
                                    'price',
                                    'delprice'],
                                include: [
                                    {
                                        model: ProductReview,
                                        as: 'reviews',
                                        where: { userId: userId },
                                        required: false,
                                        attributes: ['id', 'rating']
                                    }
                                ]
                            },
                            {
                                model: ProductVariant, as: 'variant',
                                attributes: ['id', 'size', 'color']
                            }
                        ]
                    },
                ]
            });

            if (count === 0) { return res.status(404).json({ message: "no_orders_found" }); }
            const cleanRows = rows.map(row => row.get({ plain: true }));

            res.json({
                page: page,
                totalOrders: count,
                totalPages: Math.ceil(count / limit),
                orders: cleanRows
            });
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Create new order
    // POST: Create new order
    createOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { items, is_delivery, userId, sellerId } = req.body;
            let calculatedTotal = 0;
            const buyer = await User.findByPk(userId, { transaction: t });
            if (!buyer) throw new Error('user_not_found');

            const buyerSnapshot = {
                p: buyer.phone || "",
                ...(is_delivery && {
                    a: buyer.address || "",    // Nur die Straße/Hausnummer
                    sc: buyer.subCity ?? "",  // Sub-City (Viertel)
                    c: buyer.city ?? ""          // City
                }),

            };

            const order = await Order.create({
                userId,
                sellerId,
                totalPrice: 0,
                currentStatus: 0,
                is_delivery: is_delivery,
                buyerSnapshot: buyerSnapshot
            }, { transaction: t });

            for (const item of items) {
                // 2. Variante finden und Stock prüfen (mit Sperre gegen Race Conditions)
                const variant = await ProductVariant.findByPk(item.variantId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!variant || variant.stock < item.quantity) {
                    throw new Error('insufficient_stock');
                }

                const product = await Product.findByPk(variant.productId, { transaction: t });

                const itemPrice = parseFloat(product.price || 0);
                const itemDelPrice = parseFloat(product.delprice || 0);
                calculatedTotal += (itemPrice * item.quantity);

                price_incl_delivery = is_delivery ? (calculatedTotal + itemDelPrice) : calculatedTotal;
                // 3. OrderItem in der neuen Tabelle erstellen
                await OrderItem.create({
                    orderId: order.id,
                    productId: product.id,
                    variantId: variant.id,
                    quantity: item.quantity,
                    priceAtPurchase: itemPrice
                }, { transaction: t });

                // 4. Stock abziehen
                await variant.decrement('stock', { by: item.quantity, transaction: t });
                await product.increment('orderCount', { by: 1, transaction: t });
            }
            await order.update({ totalPrice: price_incl_delivery }, { transaction: t });
            // Stats Updates
            await UserStats.increment('orderCount', { by: 1, where: { userId: userId }, transaction: t });
            await UserStats.increment(['orderCount', 'openOrders'], { by: 1, where: { userId: sellerId }, transaction: t });

            await t.commit();
            res.status(201).json(order);

        } catch (error) {
            if (t) await t.rollback();
            console.error("Error creating order:", error);
            const clientErrors = ['product_not_found', 'product_variant_not_found', 'insufficient_stock', 'product_pending_admin_conf'];
            const statusCode = clientErrors.includes(error.message) ? 400 : 500;
            res.status(statusCode).json({ message: error.message || "server_error" });
        }
    },
    // PUT: Update order status
    updateOrderStatus: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const orderId = req.params.id;
            const { status, comment } = req.body;
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, as: 'items' }],
                transaction: t
            });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ message: "order_not_found" });
            }
            const oldStatus = parseInt(order.currentStatus);
            const newStatus = parseInt(status);

            // 1. Replenishment Stock in ProductVariant
            const replenishmentStatuses = [30, 31, 42];
            if (replenishmentStatuses.includes(newStatus) && !replenishmentStatuses.includes(oldStatus)) {
                if (order.items.length === 0) {
                    await t.rollback();
                    return res.status(400).json({ message: "order_items_not_found" });
                }
                for (const item of order.items) {
                    await ProductVariant.increment('stock', {
                        by: item.quantity,
                        where: { id: item.variantId },
                        transaction: t
                    });
                }
            }

            // 2. Order Status update
            await order.update({ currentStatus: newStatus }, { transaction: t });

            // 3. Order Status History new entry
            await OrderStatusHistory.create({
                orderId: order.id,
                status: newStatus,
                comment: comment
            }, { transaction: t });


            // 4. Seller Bill Creation
            if (newStatus === 1 && oldStatus === 0) { // 1 = Confirmed, 0 = Pending
                const rawAmount = parseFloat(order.totalPrice) * 0.03;
                const roundedAmount = Number(rawAmount.toFixed(1));
                await SellerBill.create({
                    orderId: order.id,
                    sellerId: order.sellerId,
                    amount: roundedAmount,
                }, { transaction: t });
            }

            // 3. Seller State Update when order is closed
            const closingStatuses = [10, 30, 31, 42];
            if (closingStatuses.includes(newStatus) && !closingStatuses.includes(oldStatus) && oldStatus !== 0) {
                await UserStats.decrement('openOrders', {
                    by: 1,
                    where: { userId: order.sellerId },
                    transaction: t
                });
            }

            await t.commit();
            res.json({
                message: "status_updated",
                currentStatus: newStatus
            });

        } catch (error) {
            if (t) await t.rollback();
            console.error("DETAILED BACKEND ERROR:", error); // Schau in dein Terminal!
            res.status(500).json({
                message: "server_error",
                details: error.message, // Schickt den echten Fehler ans Frontend
                stack: error.stack
            });
        }
    },

    // GET: Order count per product
    getOrderCountByProduct: async (req, res) => {
        try {
            const { productId } = req.params;

            // Wir zählen in der OrderItem-Tabelle, wie oft dieses Produkt vorkommt
            const count = await OrderItem.count({
                where: {
                    productId: parseInt(productId)
                }
            });

            res.json({
                productId: parseInt(productId),
                totalOrders: count
            });
        } catch (error) {
            console.error("Error counting product orders:", error);
            res.status(500).json({ message: "server_error_get_order_count" });
        }
    },

    // GET: Seller order stats
    getSellerOrderStats: async (req, res) => {
        try {
            const { sellerId } = req.params;

            // 1. Total Orders
            const totalOrders = await Order.count({ where: { sellerId } });

            // 2. Open Orders
            const openOrders = await Order.count({
                where: { sellerId, currentStatus: 1 }
            });
            res.json({
                totalOrders,
                openOrders,
            });
        } catch (error) {
            console.error("Error fetching order stats:", error);
            res.status(500).json({ message: "server_error" });
        }
    }
};

module.exports = orderController;
