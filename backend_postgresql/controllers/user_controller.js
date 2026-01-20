const { handleError } = require('./error_handler.js');
const { User, SellerBill, UserStats, UserProfileHistory, Order, Product, UserReview, ProductReview, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
require('dotenv').config({ path: './env' });
const jwt = require('jsonwebtoken');

/**
 * Controller to handle user-related operations for MySQL
 */



const userController = {

    getSellersByIds: async (req, res) => {
        try {
            const { ids } = req.query;
            if (!ids) return res.status(400).json({ message: "missing_ids" });
            const idArray = ids.split(",");
            const users = await User.findAll({
                where: { id: { [Op.in]: idArray } },
                attributes: ['id', 'firstName', 'lastName', 'shopName', 'role', 'phone', 'address', 'imageUrl', 'city', 'subCity', 'active'],
                include: [{ model: UserStats, as: 'stats', attributes: ['avgRating', 'reviewCount'] }]
            });
            const formattedUsers = users.map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                shopName: user.shopName || "Kein Shopname",
                role: user.role,
                imageUrl: user.imageUrl || "",
                city: user.city || 0,
                subCity: user.subCity || 0,
                avgRating: user.stats?.avgRating || 0,
                reviewCount: user.stats?.reviewCount || 0,
                active: user.active,
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
                    model: sequelize.models.UserStats,
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
            if (!isNaN(identifier)) {
                user = await User.findByPk(identifier, {
                    include: [{ model: UserStats, as: 'stats', attributes: ['avgRating', 'reviewCount', 'unreadMessages', 'orderCount'] }]
                });
            }
            // 2. Versuch: Falls nicht gefunden, suche über shopName
            if (!user) {
                user = await User.findOne({
                    where: { shopSlug: identifier },
                    include: [{ model: UserStats, as: 'stats', attributes: ['avgRating', 'reviewCount', 'unreadMessages', 'orderCount'] }]
                });
            }

            if (!user) throw new Error("user_not_found");

            if (user.role == "seller") {
                res.json({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    shopName: user.shopName,
                    shopSlug: user.shopSlug,
                    active: user.active,
                    phone: user.phone || "",
                    address: user.address || "",
                    city: user.city || 0,
                    subCity: user.subCity || 0,
                    imageUrl: user.imageUrl || "",
                    orderCount: user.stats?.orderCount || 0,
                    openOrders: user.stats?.openOrders || 0,
                    reviewCount: user.stats?.reviewCount || 0,
                    averageRating: user.stats?.avgRating || 0,
                    productCount: user.stats?.productCount || 0,
                    unreadMessages: user.stats?.unreadMessages || 0
                });
            } else {
                res.json({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    shopName: user.shopName,
                    shopSlug: user.shopSlug,
                    active: user.active,
                    phone: user.phone || "",
                    address: user.address || "",
                    city: user.city || 0,
                    subCity: user.subCity || 0,
                    imageUrl: user.imageUrl || "",
                    orderCount: user.stats?.orderCount || 0,
                    reviewCount: user.stats?.reviewCount || 0,
                    averageRating: user.stats?.avgRating || 0,
                    unreadMessages: user.stats?.unreadMessages || 0
                });
            }


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

            if (!firstName || !lastName || !email || !password || !phone || !address || !role) throw new Error("missing_data");
            if (role === 'seller' && !shopName) throw new Error("shop_name_required");
            const existingUserMail = await User.findOne({ where: { email } });
            if (existingUserMail) throw new Error("user_exists_email");
            const existingUserPhone = await User.findOne({ where: { phone: phone } });
            if (existingUserPhone) throw new Error("user_exists_phone");
            if (shopName) {
                const existingShop = await User.findOne({ where: { shopName } });
                if (existingShop) throw new Error("shop_name_already_taken");
            }
            t = await sequelize.transaction();
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                shopName: role === 'seller' ? shopName : null,
                role: role || 'user',
                address: address,
                city: city || 0,
                subCity: subCity || 0,
                phone: phone,
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

            // 1. Validation
            if (!senderId || !orderId || !sellerRating || !Array.isArray(productRatings)) {
                throw new Error("missing_data");
            }

            // --- PART A: RATE SELLER (Only ONCE per order) ---

            // Check if seller was already rated for this order
            const existingUserReview = await UserReview.findOne({ where: { senderId, orderId } });
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
                const newAvg = ((parseFloat(userStats.avgRating) * userStats.reviewCount) + sellerRating) / newCount;
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
                    const newProdAvg = ((parseFloat(product.avgRating) * product.reviewCount) + p.rating) / newProdCount;
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
    }
};


module.exports = userController;
