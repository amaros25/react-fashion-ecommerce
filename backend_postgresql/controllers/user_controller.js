const { handleError } = require('./error_handler.js');
const { User, SellerBill, UserStats, UserProfileHistory, Order, Product, UserReview, ProductReview, OrderItem, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
require('dotenv').config({ path: './env' });
const jwt = require('jsonwebtoken');

/**
 * Controller to handle user-related operations for MySQL
 */



const userController = {

    _verifyStatus: async (userId) => {
        const stats = await UserStats.findOne({ where: { userId } });
        if (!stats) return;

        if (['banned', 'deleted', 'pending'].includes(stats.active)) {
            const error = new Error(`user_${stats.active}`);
            error.statusCode = 403;
            throw error;
        }
    },

    getSellersByIds: async (req, res) => {
        try {
            const { ids } = req.query;
            if (!ids) return res.status(400).json({ message: "missing_ids" });
            const idArray = ids.split(",");
            const users = await User.findAll({
                where: { id: { [Op.in]: idArray } },
                attributes: ['id', 'firstName', 'lastName', 'shopName', 'role', 'phone', 'address', 'imageUrl', 'city', 'subCity'],
                include: [{ model: UserStats, as: 'stats', attributes: ['avgRating', 'reviewCount', 'active'] }]
            });
            const formattedUsers = users.map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                shopName: user.shopName || "Kein Shopname",
                role: user.role,
                imageUrl: user.imageUrl || "",
                city: user.city,
                subCity: user.subCity,
                avgRating: user.stats?.avgRating || 0,
                reviewCount: user.stats?.reviewCount || 0,
                active: user.stats?.active,
                phone: user.phone || "",
                address: user.address || "",
            }));

            res.json(formattedUsers);
        } catch (error) {
            console.error('Error fetching users by IDs:', error);
            await handleError(res, error, null, "failed_to_fetch_users_by_ids");
        }
    },

    getPublicSeller: async (req, res) => {
        try {
            const { id } = req.params;
            const seller = await User.findByPk(id, {
                attributes: ['shopName', 'city', 'subCity', 'imageUrl'],
                include: [{
                    model: UserStats,
                    as: 'stats',
                    attributes: ['reviewCount', 'avgRating']
                }]
            });
            if (!seller) throw new Error("seller_not_found");
            const publicData = {
                shopName: seller.shopName,
                imageUrl: seller.imageUrl || '',
                city: seller.city,
                subCity: seller.subCity,
                stats: {
                    reviewCount: seller.stats?.reviewCount || 0,
                    averageRating: seller.stats?.avgRating || 0
                }
            };
            res.json(publicData);
        } catch (error) {
            await handleError(res, error, null, "failed_to_fetch_seller");
        }
    },


    // GET: User by ID with history formatting
    getUserById: async (req, res) => {
        try {
            const identifier = req.params.id;
            let user;
            const commonInclude = [{
                model: UserStats,
                as: 'stats',
                attributes: ['avgRating', 'reviewCount', 'unreadMessages', 'orderCount', 'views', 'openOrders', 'productCount', 'active']
            }];
            if (!isNaN(identifier)) {
                user = await User.findByPk(identifier, {
                    include: commonInclude
                });
            }
            // 2. Versuch: Falls nicht gefunden, suche über shopName
            if (!user) {
                user = await User.findOne({
                    where: { shopSlug: identifier },
                    include: commonInclude
                });
            }

            if (!user) throw new Error("user_not_found");

            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                shopSlug: user.shopSlug,
                active: user.stats?.active,
                phone: user.phone || "",
                address: user.address || "",
                city: user.city,
                subCity: user.subCity,
                imageUrl: user.imageUrl || "",
                orderCount: user.stats?.orderCount || 0,
                reviewCount: user.stats?.reviewCount || 0,
                averageRating: user.stats?.avgRating || 0,
                unreadMessages: user.stats?.unreadMessages || 0,
                views: user.stats?.views || 0
            };
            if (user.role === "seller") {
                userData.openOrders = user.stats?.openOrders || 0;
                userData.productCount = user.stats?.productCount || 0;
            }
            res.json(userData);
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            await handleError(res, error, null, "failed_to_fetch_user_by_id");
        }
    },

    // POST: Create a new user (Registration)
    createUser: async (req, res) => {
        console.log("createUser", req.body);
        let t;
        try {
            const {
                firstName, lastName, email, password,
                phone, address, city, subCity,
                shopName, role
            } = req.body;

            if (!firstName || !lastName || !email || !password || !role || !phone) throw new Error("missing_data");
            if (role === 'seller' && shopName) {
                const existingShop = await User.findOne({ where: { shopName } });
                if (existingShop) throw new Error("shop_name_already_taken");
            }
            const existingUserMail = await User.findOne({ where: { email } });
            if (existingUserMail) throw new Error("user_exists_email");

            if (phone) {
                const existingUserPhone = await User.findOne({ where: { phone: phone } });
                if (existingUserPhone) throw new Error("user_exists_phone");
            }
            t = await sequelize.transaction();
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                shopName: (role === 'seller' && shopName) ? shopName : null,
                role: role || 'user',
                address: address || "",
                city: city,
                subCity: subCity,
                phone: phone || "",
                imageUrl: ""

            }, { transaction: t });

            await t.commit();
            if (!user) throw new Error("registration_failed");
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(201).json({
                success: true,
                message: "registration_successful",
                userId: user.id,
                token: token
            });
        } catch (error) {
            console.error('Error creating user:', error);
            await handleError(res, error, t, "registration_failed");
        }
    },


    // PUT: Update user image (history support)
    updateUserImage: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { imageUrl } = req.body;
            await userController._verifyStatus(req.params.id);
            const user = await User.findByPk(req.params.id);
            if (!user) {
                throw new Error("user_not_found");
            }
            if (user.imageUrl === imageUrl) {
                throw new Error("no_changes_detected");
            }
            await UserProfileHistory.create({
                userId: user.id,
                changeType: 'image',
                newData: { imageUrl }
            }, { transaction: t });

            await user.update({ imageUrl }, { transaction: t });
            await t.commit();
            res.json({
                message: "success",
                userId: user.id,
                imageUrl: user.imageUrl
            });
        } catch (error) {
            console.error('Error updating user image:', error);
            await handleError(res, error, t, "image_update_failed");
        }
    },

    // PATCH: Update user contact (history support)
    updateUserAddress: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { address: addressObj } = req.body;
            await userController._verifyStatus(req.params.id);
            if (!addressObj) {
                throw new Error("missing_address_data");
            }
            const { address, city, subCity } = addressObj;
            const user = await User.findByPk(req.params.id);
            if (!user) {
                throw new Error("user_not_found");
            }
            const changes = {};
            if (address !== undefined && user.address !== address) {
                changes.address = address;
            }
            if (city !== undefined && user.city !== city) {
                changes.city = city;
            }
            if (subCity !== undefined && user.subCity !== subCity) {
                changes.subCity = subCity;
            }
            if (Object.keys(changes).length === 0) {
                throw new Error("no_changes_detected");
            }
            await UserProfileHistory.create({
                userId: user.id,
                changeType: 'address',
                newData: changes
            }, { transaction: t });
            await user.update(changes, { transaction: t });
            await t.commit();
            res.json({
                message: "success",
                userId: user.id,
                address: user.address,
                city: user.city,
                subCity: user.subCity
            });
        } catch (error) {
            console.error('Error updating user:', error);
            await handleError(res, error, t, "address_update_failed");
        }
    },

    updateUserPhone: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { phone } = req.body;
            await userController._verifyStatus(req.params.id);
            const user = await User.findByPk(req.params.id);
            if (!user) {
                throw new Error("user_not_found");
            }
            if (user.phone === phone) {
                throw new Error("no_changes_detected");
            }
            const phoneExists = await User.findOne({ where: { phone } });
            if (phoneExists && phoneExists.id !== user.id) {
                throw new Error("phone_already_in_use");
            }
            await UserProfileHistory.create({
                userId: user.id,
                changeType: 'phone',
                newData: { phone }
            }, { transaction: t });
            await user.update({ phone }, { transaction: t });
            await t.commit();
            res.json({
                message: "success",
                userId: user.id,
                phone: user.phone
            });
        } catch (error) {
            console.error('Error updating user:', error);
            await handleError(res, error, t, "phone_update_failed");
        }
    },

    updateUserShopName: async (req, res) => {
        console.log("updateUserShopName");
        const t = await sequelize.transaction();
        try {
            console.log(req.body);
            const { shopName } = req.body;
            await userController._verifyStatus(req.params.id);
            if (!shopName || shopName.trim().length < 3) throw new Error("invalid_shop_name");
            console.log("shopName: ", shopName);

            const user = await User.findByPk(req.params.id);
            console.log("user: ", user);
            if (!user) throw new Error("user_not_found");
            if (user.role !== 'seller') throw new Error("only_sellers_can_have_shopname");

            if (user.shopName === shopName) throw new Error("no_changes_detected");

            const shopExists = await User.findOne({ where: { shopName } });
            if (shopExists && shopExists.id !== user.id) throw new Error("shop_name_already_taken");

            await UserProfileHistory.create({
                userId: user.id,
                changeType: 'shopName',
                newData: { shopName }
            }, { transaction: t });

            await user.update({ shopName }, { transaction: t });
            await t.commit();
            res.json({
                message: "success",
                userId: user.id,
                shopName: user.shopName
            });
        } catch (error) {
            console.log("FULL ERROR DETAILS:");
            console.log("Name:", error.name);
            console.log("Message:", error.message);
            console.log("Stack:", error.stack);
            console.error('Error updating shop name:', error);
            await handleError(res, error, t, "shop_name_update_failed");
        }
    },

    getSellerBills: async (req, res) => {
        try {
            const { sellerId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            if (req.user.id !== parseInt(sellerId) && req.user.role !== 'admin') throw new Error("unauthorized_access");

            const { count, rows } = await SellerBill.findAndCountAll({
                where: { sellerId },
                include: [
                    { model: Order, as: 'order', attributes: ['orderNumber'] },
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                bills: rows,
                totalCount: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Error fetching seller bills:', error);
            await handleError(res, error, null, "failed_to_fetch_seller_bills");
        }
    },


    rateUserAndProduct: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id: receiverId } = req.params; // Seller ID
            const { userId: senderId, orderId, sellerRating, productRatings } = req.body;
            // productRatings should be an array: [{ productId, rating, comment }, ...]
            await userController._verifyStatus(senderId);
            // 1. Validation
            if (!senderId || !orderId || !sellerRating || !Array.isArray(productRatings)) {
                throw new Error("missing_data");
            }

            const order = await Order.findOne({
                where: { id: orderId, userId: senderId },
                include: [{ model: OrderItem, as: 'items', attributes: ['productId'] }],
                transaction: t
            });

            if (!order) throw new Error("order_not_found_or_unauthorized");

            const boughtProductIds = order.items.map(item => item.productId);
            const isValid = productRatings.every(p => boughtProductIds.includes(p.productId));

            if (!isValid) throw new Error("invalid_products_in_review");

            // --- PART A: RATE SELLER (Only ONCE per order) ---

            // Check if seller was already rated for this order
            const existingUserReview = await UserReview.findOne({ where: { senderId, orderId }, transaction: t });
            if (existingUserReview) {
                throw new Error("order_already_rated");
            }

            // Create Seller Review (linking to the first product as a reference if needed)
            await UserReview.create({
                senderId,
                receiverId,
                orderId,
                productId: productRatings[0].productId,
                rating: sellerRating,
                comment: "" // Usually sellers get stars, products get comments
            }, { transaction: t });

            // Update Seller Stats
            const userStats = await UserStats.findOne({ where: { userId: receiverId }, transaction: t });
            if (userStats) {
                const newCount = userStats.reviewCount + 1;
                const newAvg = ((parseFloat(userStats.avgRating || 0) * userStats.reviewCount) + sellerRating) / newCount;
                await userStats.update({
                    reviewCount: newCount,
                    avgRating: parseFloat(newAvg.toFixed(2))
                }, { transaction: t });
            }

            // --- PART B: RATE ALL PRODUCTS IN THE ARRAY ---

            for (const p of productRatings) {
                // Create Product Review
                await ProductReview.create({
                    productId: p.productId,
                    userId: senderId,
                    rating: p.rating,
                    comment: p.comment
                }, { transaction: t });

                // Update Product Stats
                const product = await Product.findByPk(p.productId, { transaction: t });
                if (product) {
                    const newProdCount = product.reviewCount + 1;
                    const newProdAvg = ((parseFloat(product.avgRating || 0) * product.reviewCount) + p.rating) / newProdCount;
                    await product.update({
                        reviewCount: newProdCount,
                        avgRating: parseFloat(newProdAvg.toFixed(2))
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.json({ message: "success_rate_all" });

        } catch (error) {
            console.error('Multi-Rating Error:', error);
            await handleError(res, error, t, "rate_user_and_product_failed");
        }
    },

    incrementViews: async (req, res) => {
        try {
            const { id } = req.params;
            const stats = await UserStats.findOne({ where: { userId: id } });
            if (!stats) throw new Error("stats_not_found");

            await stats.increment('views', { by: 1 });
            res.json({ message: "success", views: stats.views + 1 });
        } catch (error) {
            console.error('Error incrementing views:', error);
            await handleError(res, error, null, "failed_to_increment_views");
        }
    }
};


module.exports = userController;
