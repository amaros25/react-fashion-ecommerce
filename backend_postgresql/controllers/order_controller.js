const { Order, Product, UserStats, User, SellerBill, OrderStatusHistory, OrderItem, ProductVariant, ProductReview, UserReview, sequelize } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
const { handleError } = require('./error_handler.js');

/**
 * Controller to handle order-related operations for MySQL
 */


const orderController = {



    _verifyStatus: async (userId) => {
        const stats = await UserStats.findOne({ where: { userId } });
        if (!stats) return;

        if (['banned', 'deleted', 'pending'].includes(stats.active)) {
            const error = new Error(`user_${stats.active}`);
            error.statusCode = 403;
            throw error;
        }
    },

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
                throw new Error("order_not_found_get_order_by_id");
            }
            res.json(order);
        } catch (error) {
            await handleError(res, error, null, "get_order_by_id_error");
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
                throw new Error("order_not_found");
            }
            res.json(order);
        } catch (error) {
            await handleError(res, error, null, "get_order_by_number_error");
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
            await handleError(res, error, null, "get_seller_orders_error");
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

            if (count === 0) { throw new Error("no_orders_found") }
            const cleanRows = rows.map(row => row.get({ plain: true }));

            res.json({
                page: page,
                totalOrders: count,
                totalPages: Math.ceil(count / limit),
                orders: cleanRows
            });
        } catch (error) {
            await handleError(res, error, null, "get_user_orders_error");
        }
    },

    // POST: Create new order
    createOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { items, is_delivery, userId, sellerId, paymentMethod } = req.body;
            let calculatedTotal = 0;
            let minDeliveryPrice = Infinity;

            await orderController._verifyStatus(userId);

            if (!items || items.length === 0) throw new Error("at_least_one_item_required");
            const buyer = await User.findByPk(userId, { transaction: t });
            if (!buyer) throw new Error('user_not_found');

            const buyerSnapshot = {
                p: buyer.phone || "",
                ...(is_delivery && {
                    a: buyer.address || "",
                    sc: buyer.subCity ?? "",
                    c: buyer.city ?? ""
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
                const variant = await ProductVariant.findByPk(item.variantId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!variant || variant.stock < item.quantity) {
                    throw new Error('insufficient_stock');
                }

                const product = await Product.findByPk(variant.productId, { transaction: t });
                if (product.currentState !== 1) {
                    throw new Error("product_not_active");
                }
                const itemPrice = parseFloat(product.price || 0);
                const itemDelPrice = parseFloat(product.delprice || 0);
                calculatedTotal += (itemPrice * item.quantity);
                if (itemDelPrice < minDeliveryPrice) {
                    minDeliveryPrice = itemDelPrice;
                }
                await OrderItem.create({
                    orderId: order.id,
                    productId: product.id,
                    variantId: variant.id,
                    quantity: item.quantity,
                    priceAtPurchase: itemPrice
                }, { transaction: t });

                await variant.decrement('stock', { by: item.quantity, transaction: t });
                await product.increment('orderCount', { by: 1, transaction: t });
            }
            const finalDeliveryCharge = minDeliveryPrice === Infinity ? 0 : minDeliveryPrice;
            const price_incl_delivery = is_delivery ? (calculatedTotal + finalDeliveryCharge) : calculatedTotal;
            await order.update({ totalPrice: price_incl_delivery }, { transaction: t });
            await UserStats.increment('orderCount', { by: 1, where: { userId: userId }, transaction: t });
            await UserStats.increment(['orderCount', 'openOrders'], { by: 1, where: { userId: sellerId }, transaction: t });

            // Flouci Payment Integration
            if (paymentMethod === 'flouci') {
                try {
                    // Flouci API expects amount in millimes (1 TND = 1000 millimes)
                    const amountInMillimes = Math.round(price_incl_delivery * 1000);

                    const flouciData = {
                        "app_token": process.env.FLOUCI_APP_TOKEN || "test_token",
                        "app_public": process.env.FLOUCI_APP_PUBLIC || "test_public",
                        "amount": amountInMillimes,
                        "accept_card": "true",
                        "session_timeout_secs": 1200,
                        "success_link": `${process.env.FRONTEND_URL}/payment-success?orderId=${order.id}`,
                        "fail_link": `${process.env.FRONTEND_URL}/payment-fail?orderId=${order.id}`,
                        "developer_tracking_id": order.orderNumber
                    };

                    const response = await axios.post('https://developers.flouci.com/api/v2/generate_payment', flouciData);

                    if (response.data && response.data.success) {
                        await order.update({
                            paymentInfo: {
                                method: 'flouci',
                                payment_id: response.data.result.payment_id,
                                status: 'pending'
                            }
                        }, { transaction: t });

                        await t.commit();
                        return res.status(201).json({
                            success: true,
                            order,
                            result_url: response.data.result.link
                        });
                    } else {
                        throw new Error("flouci_session_generation_failed");
                    }
                } catch (flouciError) {
                    console.error("Flouci Error:", flouciError.response?.data || flouciError.message);
                    throw new Error("payment_service_unavailable");
                }
            }

            await t.commit();
            res.status(201).json({ success: true, order });

        } catch (error) {
            await handleError(res, error, t, "create_order_error");
        }
    },
    // PUT: Update order status
    updateOrderStatus: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const orderId = req.params.id;
            const { status, comment } = req.body;

            if (comment && comment.length > 100) {
                throw new Error("comment_too_long");
            }
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, as: 'items' }],
                transaction: t
            });
            if (!order) {
                throw new Error("order_not_found");
            }

            await orderController._verifyStatus(order.sellerId);

            const oldStatus = parseInt(order.currentStatus);
            const newStatus = parseInt(status);
            const replenishmentStatuses = [30, 31, 42];
            if (replenishmentStatuses.includes(newStatus) && !replenishmentStatuses.includes(oldStatus)) {
                if (order.items.length === 0) {
                    throw new Error("order_items_not_found");
                }
                for (const item of order.items) {
                    await ProductVariant.increment('stock', {
                        by: item.quantity,
                        where: { id: item.variantId },
                        transaction: t
                    });
                }
            }
            await order.update({ currentStatus: newStatus }, { transaction: t });
            await OrderStatusHistory.create({
                orderId: order.id,
                status: newStatus,
                comment: comment
            }, { transaction: t });
            /*  if (Number(newStatus) === 3 || Number(newStatus) === 41) {
                  const rawAmount = parseFloat(order.totalPrice) * 0.03;
                  const roundedAmount = Number(rawAmount.toFixed(1));
                  await SellerBill.create({
                      orderId: order.id,
                      sellerId: order.sellerId,
                      amount: roundedAmount,
                  }, { transaction: t });
              }*/
            const closingStatuses = [3, 10, 13, 22, 24, 30, 31, 41, 42];
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
                currentStatus: newStatus,
                comment: comment
            });

        } catch (error) {
            await handleError(res, error, t, "update_order_status_error");
        }
    },

    // GET: Order count per product
    getOrderCountByProduct: async (req, res) => {
        try {
            const { productId } = req.params;
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
            await handleError(res, error, null, "get_order_count_by_product_error");
        }
    },

    // GET: Seller order stats
    getSellerOrderStats: async (req, res) => {
        try {
            const { sellerId } = req.params;
            await orderController._verifyStatus(sellerId);

            const totalOrders = await Order.count({ where: { sellerId } });
            const openOrders = await Order.count({
                where: { sellerId, currentStatus: 1 }
            });
            res.json({
                totalOrders,
                openOrders,
            });
        } catch (error) {
            await handleError(res, error, null, "get_seller_order_stats_error");
        }
    },
    // GET: Verify Flouci Payment
    verifyFlouciPayment: async (req, res) => {
        try {
            const { paymentId } = req.params;
            const APP_PUBLIC = process.env.FLOUCI_APP_PUBLIC || "test_public";
            const APP_TOKEN = process.env.FLOUCI_APP_TOKEN || "test_token";

            const response = await axios.get(`https://developers.flouci.com/api/v2/verify_payment/${paymentId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'apppublic': APP_PUBLIC,
                    'apptoken': APP_TOKEN
                }
            });

            if (response.data && response.data.success) {
                const { status, developer_tracking_id } = response.data.result;

                if (status === 'SUCCESS') {
                    const order = await Order.findOne({ where: { orderNumber: developer_tracking_id } });
                    if (order) {
                        // Status 1 = Paid / Active
                        await order.update({
                            currentStatus: 1,
                            paymentInfo: {
                                ...order.paymentInfo,
                                status: 'paid',
                                verification_data: response.data.result
                            }
                        });

                        await OrderStatusHistory.create({
                            orderId: order.id,
                            status: 1,
                            comment: "Payment verified via Flouci"
                        });
                    }
                }
                res.json(response.data);
            } else {
                res.status(400).json({ success: false, message: "verification_failed" });
            }
        } catch (error) {
            await handleError(res, error, null, "verify_payment_error");
        }
    }
};

module.exports = orderController;
