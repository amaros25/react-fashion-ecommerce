const mongoose = require('mongoose');

const sellerReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "orders", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SellerReview', sellerReviewSchema);
