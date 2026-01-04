const mongoose = require("mongoose");

const sellerBillSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    billNumber: { type: String, unique: true, required: true },
    isPaid: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SellerBill", sellerBillSchema);
