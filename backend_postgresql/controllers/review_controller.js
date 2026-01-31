const { UserReview, ProductReview, UserStats, Product, sequelize } = require('../models');
const { handleError } = require('./error_handler.js');


const reviewController = {



    _verifyStatus: async (userId) => {
        const stats = await UserStats.findOne({ where: { userId } });
        if (!stats) return;

        if (['banned', 'deleted', 'pending'].includes(stats.active)) {
            const error = new Error(`unauthorized_access: user_${stats.active}`);
            error.statusCode = 403;
            throw error;
        }
    },
    rateSeller: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { sellerId, orderId, userId, rating, comment } = req.body;

            if (!sellerId || !orderId || !userId || !rating) {
                throw new Error("missing_data");
            }
            await reviewController._verifyStatus(userId);

            const existingReview = await UserReview.findOne({
                where: { senderId: userId, orderId: orderId }
            });

            if (existingReview) {
                throw new Error("seller_already_rated_for_this_order");
            }

            await UserReview.create({
                senderId: userId,
                receiverId: sellerId,
                orderId,
                rating,
                comment: comment || ""
            }, { transaction: t });

            const userStats = await UserStats.findOne({ where: { userId: sellerId }, transaction: t });
            if (userStats) {
                const newCount = userStats.reviewCount + 1;
                const newAvg = ((parseFloat(userStats.avgRating) * userStats.reviewCount) + rating) / newCount;
                await userStats.update({
                    reviewCount: newCount,
                    avgRating: parseFloat(newAvg.toFixed(2))
                }, { transaction: t });
            }

            await t.commit();
            res.json({ message: "seller_rating_success" });

        } catch (error) {
            await handleError(res, error, t, "failed_to_rate_seller");
        }
    },

    // --- PART 2: RATE SINGLE PRODUCT ---
    rateProduct: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { productId, userId, rating, comment } = req.body;

            if (!productId || !userId || !rating) {
                throw new Error("missing_data");
            }

            await reviewController._verifyStatus(userId);

            // Optional: Hier prüfen, ob User das Produkt schon mal bewertet hat
            await ProductReview.create({
                productId,
                userId,
                rating,
                comment: comment || ""
            }, { transaction: t });

            const product = await Product.findByPk(productId, { transaction: t });
            if (product) {
                const newCount = (product.reviewCount || 0) + 1;
                const currentAvg = parseFloat(product.avgRating || 0);
                const newAvg = ((currentAvg * (product.reviewCount || 0)) + rating) / newCount;

                await product.update({
                    reviewCount: newCount,
                    avgRating: parseFloat(newAvg.toFixed(2))
                }, { transaction: t });
            } else {
                throw new Error("product_not_found");
            }

            await t.commit();
            res.json({ message: "product_rating_success" });

        } catch (error) {
            await handleError(res, error, t, "failed_to_rate_product");
        }
    }
};

// Exportiere die Klasse selbst
module.exports = reviewController;