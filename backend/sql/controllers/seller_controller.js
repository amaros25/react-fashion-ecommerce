const { Seller, SellerAddress, SellerPhone, SellerImage, SellerReview, SellerBill, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op, fn, col } = require('sequelize');

/**
 * Controller to handle seller-related operations for MySQL
 */
const sellerController = {
    // GET: Sellers by IDs
    getSellerByIds: async (req, res) => {
        try {
            const ids = req.query.ids.split(",");
            const sellers = await Seller.findAll({
                where: { id: { [Op.in]: ids } },
                attributes: {
                    exclude: ['password'],
                    include: [
                        [sequelize.literal('(SELECT AVG(rating) FROM seller_reviews WHERE seller_reviews.sellerId = Seller.id)'), 'averageRating'],
                        [sequelize.literal('(SELECT COUNT(*) FROM seller_reviews WHERE seller_reviews.sellerId = Seller.id)'), 'reviewCount']
                    ]
                }
            });
            res.json(sellers);
        } catch (error) {
            console.error('Error fetching sellers by IDs:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Single seller by ID
    getSellerById: async (req, res) => {
        try {
            const { id } = req.params;
            const seller = await Seller.findByPk(id, {
                include: [
                    { model: SellerAddress, as: 'addresses', limit: 1, order: [['dateModified', 'DESC']] },
                    { model: SellerPhone, as: 'phones', limit: 1, order: [['dateModified', 'DESC']] },
                    { model: SellerImage, as: 'images', limit: 1, order: [['dateModified', 'DESC']] }
                ]
            });

            if (!seller) return res.status(404).json({ message: "seller_not_found" });

            // Aggregate stats
            const stats = await SellerReview.findOne({
                where: { sellerId: id },
                attributes: [
                    [fn('AVG', col('rating')), 'averageRating'],
                    [fn('COUNT', col('id')), 'reviewCount']
                ],
                raw: true
            });

            const lastAddress = seller.addresses[0] || {};
            const lastPhone = seller.phones[0] || {};
            const lastImage = seller.images[0] || {};

            res.json({
                _id: seller.id,
                firstName: seller.name.split(' ')[0], // Best effort split
                lastName: seller.name.split(' ').slice(1).join(' '),
                shopName: seller.companyName,
                address: lastAddress.address || "",
                city: lastAddress.city || 0,
                subCity: lastAddress.subCity || 0,
                phone: lastPhone.phone || "",
                email: seller.email,
                averageRating: parseFloat(stats.averageRating || 0),
                reviewCount: parseInt(stats.reviewCount || 0),
                active: seller.active,
                image: lastImage.imageUrl || "",
            });
        } catch (error) {
            console.error('Error fetching seller by ID:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Create Seller (Registration)
    createSeller: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { firstName, lastName, email, password, shopName, address, phone } = req.body;

            if (!firstName || !lastName || !email || !password || !shopName || !address || !phone) {
                return res.status(400).json({ message: "missing_data" });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ message: "user_exists_email" });

            const existingSeller = await Seller.findOne({ where: { email } });
            if (existingSeller) return res.status(400).json({ message: "seller_exists_email" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const seller = await Seller.create({
                name: `${firstName} ${lastName}`,
                email,
                password: hashedPassword,
                companyName: shopName,
                phone: typeof phone === 'object' ? phone.phone : phone, // Redundant but for model safety
                address: typeof address === 'object' ? address.address : address // Redundant but for model safety
            }, { transaction: t });

            // History
            await SellerPhone.create({
                sellerId: seller.id,
                phone: typeof phone === 'object' ? phone.phone : phone
            }, { transaction: t });

            await SellerAddress.create({
                sellerId: seller.id,
                address: typeof address === 'object' ? address.address : address,
                city: address.city || 0,
                subCity: address.subCity || 0
            }, { transaction: t });

            await t.commit();
            res.status(201).json({ message: "user_created_successfully", userId: seller.id });
        } catch (error) {
            await t.rollback();
            console.error('Error creating seller:', error);
            res.status(500).json({ message: "register_seller_failed" });
        }
    },

    // PUT: Update seller contact
    updateSeller: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { address, phone } = req.body;
            const seller = await Seller.findByPk(req.params.id);
            if (!seller) return res.status(404).json({ message: "seller_not_found" });

            if (address) {
                await SellerAddress.create({
                    sellerId: seller.id,
                    address: address.address,
                    city: address.city,
                    subCity: address.subCity
                }, { transaction: t });
            }

            if (phone) {
                await SellerPhone.create({ sellerId: seller.id, phone }, { transaction: t });
            }

            await t.commit();
            res.json(seller);
        } catch (error) {
            await t.rollback();
            console.error('Error updating seller:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Rate seller
    rateSeller: async (req, res) => {
        try {
            const { id } = req.params;
            const { userId, orderId, productId, rating } = req.body;

            if (!userId || !orderId || !rating) return res.status(400).json({ message: "missing_data" });

            const existing = await SellerReview.findOne({ where: { sellerId: id, userId, orderId } });
            if (existing) return res.status(400).json({ message: "review_already_exists_for_this_order" });

            await SellerReview.create({
                userId,
                sellerId: id,
                orderId,
                productId,
                rating
            });

            res.json({ message: "success_rate_seller" });
        } catch (error) {
            console.error('Error rating seller:', error);
            res.status(500).json({ message: "failed_to_rate_seller" });
        }
    },

    // PUT: Update seller image
    updateSellerImage: async (req, res) => {
        try {
            const { imageUrl } = req.body;
            const seller = await Seller.findByPk(req.params.id);
            if (!seller) return res.status(404).json({ message: "seller_not_found" });

            await SellerImage.create({ sellerId: seller.id, imageUrl });
            res.json({ message: "seller_image_updated_successfully", seller });
        } catch (error) {
            console.error('Error updating seller image:', error);
            res.status(500).json({ message: "seller_image_update_failed" });
        }
    },

    // GET: Seller bills
    getSellerBills: async (req, res) => {
        try {
            const { sellerId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await SellerBill.findAndCountAll({
                where: { sellerId },
                order: [['date', 'DESC']],
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
            res.status(500).json({ message: "server_error" });
        }
    }
};

module.exports = sellerController;
