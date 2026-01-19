const { UserReview, ProductReview, UserStats, Product, sequelize } = require('../models');

class ReviewController {
    // --- PART 1: RATE SELLER ---
    static async rateSeller(req, res) {
        const t = await sequelize.transaction();
        try {
            const { sellerId, orderId, userId, rating, comment } = req.body;

            if (!sellerId || !orderId || !userId || !rating) {
                await t.rollback();
                return res.status(400).json({ message: "missing_data" });
            }

            const existingReview = await UserReview.findOne({
                where: { senderId: userId, orderId: orderId }
            });

            if (existingReview) {
                await t.rollback();
                return res.status(400).json({ message: "seller_already_rated_for_this_order" });
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
            if (t) await t.rollback();
            console.error('Seller Rating Error:', error);
            res.status(500).json({ message: "failed_to_rate_seller" });
        }
    }

    // --- PART 2: RATE SINGLE PRODUCT ---
    static async rateProduct(req, res) {
        const t = await sequelize.transaction();
        try {
            const { productId, userId, rating, comment } = req.body;

            if (!productId || !userId || !rating) {
                await t.rollback();
                return res.status(400).json({ message: "missing_data" });
            }

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
            }

            await t.commit();
            res.json({ message: "product_rating_success" });

        } catch (error) {
            if (t) await t.rollback();
            console.error('Product Rating Error:', error);
            res.status(500).json({ message: "failed_to_rate_product" });
        }
    }
}

// Exportiere die Klasse selbst
module.exports = ReviewController;