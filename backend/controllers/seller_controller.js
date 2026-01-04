const Seller = require("../models/seller.js");
const User = require("../models/user");
const SellerReview = require("../models/seller_review.js");
const SellerBill = require("../models/seller_bill.js");
const Product = require("../models/product.js");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

function generateBillNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `FACT-${randomLetter}${randomNum}`;
}

exports.getSellerByIds = async (req, res) => {
  try {
    const ids = req.query.ids.split(",");
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "SellerIds must be an Array" });
    }
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const sellers = await Seller.aggregate([
      { $match: { _id: { $in: objectIds } } },
      {
        $lookup: {
          from: "sellerreviews",
          localField: "_id",
          foreignField: "seller",
          as: "reviews"
        }
      },
      {
        $addFields: {
          averageRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
          reviewCount: { $size: "$reviews" }
        }
      },
      {
        $project: {
          reviews: 0,
          password: 0
        }
      }
    ]);

    res.json(sellers);
  } catch (error) {
    console.error("❌ Fehler beim Laden der Verkäufer (IDs):", error);
    res.status(500).json({ error: error.message });
  }
};

// Get seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).lean();
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    const stats = await SellerReview.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);
    seller.averageRating = stats.length > 0 ? stats[0].averageRating : 0;
    seller.reviewCount = stats.length > 0 ? stats[0].reviewCount : 0;
    if (seller.address && seller.address.length > 0) {
      seller.address = seller.address[seller.address.length - 1];
    }
    if (seller.phone && seller.phone.length > 0) {
      seller.phone = seller.phone[seller.phone.length - 1];
    }
    res.json(seller);
  } catch (err) {
    console.error("❌ Fehler beim Laden des Verkäufers:", err);
    res.status(500).json({ message: "Error fetching seller", error: err });
  }
};

// Create Seller
exports.createSeller = async (req, res) => {
  try {
    const { firstName, lastName, email, password, shopName, address, phone } = req.body;
    console.log(req.body);
    if (!firstName || !lastName || !email || !password || !shopName || !address || !phone) {
      return res.status(400).json({ message: "missing_data" });
    }

    let phoneNumber = null;
    if (Array.isArray(phone) && phone.length > 0) {
      phoneNumber = phone[0].phone;
    } else if (typeof phone === 'object' && phone.phone) {
      phoneNumber = phone.phone;
    } else {
      phoneNumber = phone;
    }
    const existingUserEmail = await User.findOne({
      $or: [
        { email },
      ]
    });
    if (existingUserEmail) {
      return res.status(400).json({ message: "user_exists_email" });
    }
    const existingSellerEmail = await Seller.findOne({
      $or: [
        { email },
      ]
    });
    if (existingSellerEmail) {
      return res.status(400).json({ message: "seller_exists_email" });
    }

    const existingUserPhone = await User.findOne({
      $or: [
        { 'phone.phone': phoneNumber },
      ]
    });

    if (existingUserPhone) {
      return res.status(400).json({ message: "user_exists_phone" });
    }

    const existingSellerPhone = await Seller.findOne({
      $or: [
        { 'phone.phone': phoneNumber },
      ]
    });
    if (existingSellerPhone) {
      return res.status(400).json({ message: "seller_exists_phone" });
    }

    const existingSellerShopName = await Seller.findOne({
      $or: [
        { shopName },
      ]
    });
    if (existingSellerShopName) {
      return res.status(400).json({ message: "seller_exists_shop_name" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone,
      address: address,
      shopName,
    });

    await newSeller.save();

    res.status(201).json({ message: "user_created_successfully", userId: newSeller._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "register_seller_failed" });
  }
};

// Update Seller (Address & Phone)
exports.updateSeller = async (req, res) => {
  try {
    const { address, phone } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    if (address) {
      seller.address.push({
        address: address.address,
        city: address.city,
        subCity: address.subCity,
        dateModified: new Date()
      });
    }
    if (phone) {
      seller.phone.push({
        phone: phone,
        dateModified: new Date()
      });
    }
    await seller.save();
    res.json(seller);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating seller", error: err });
  }
};

// Rate Seller
exports.rateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, orderId, productId, rating } = req.body;

    if (!userId || !orderId || !rating) {
      return res.status(400).json({ message: "Data missing: userId, orderId, and rating are required." });
    }
    const seller = await Seller.findById(id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    const exists = await SellerReview.findOne({ seller: id, user: userId, order: orderId });
    if (exists) {
      return res.status(400).json({ message: "review_already_exists_for_this_order" });
    }
    const newReview = new SellerReview({
      user: userId,
      seller: id,
      order: orderId,
      product: productId,
      rating: rating
    });
    await newReview.save();
    res.json({ message: "success_rate_seller" });
  } catch (err) {
    console.error("❌ Fehler beim Bewerten des Verkäufers:", err);
    res.status(500).json({ message: "failed_to_rate_seller" });
  }
};

exports.updateSellerImage = async (req, res) => {
  try {
    const userId = req.params.id;
    const { imageUrl } = req.body;
    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({ message: "seller_not_found" });
    }
    seller.image.push({
      imageUrl: imageUrl,
      dateModified: new Date()
    });
    await seller.save();
    res.status(200).json({
      message: "seller_image_updated_successfully",
      seller,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "seller_image_update_failed",
      error: err.message,
    });
  }
};

exports.createSellerBill = async (order, item) => {
  try {
    const product = await Product.findById(item.productId);
    if (!product) return;

    const commission = (product.price * item.quantity) * 0.03;

    let billNumber;
    let exists = true;
    while (exists) {
      billNumber = generateBillNumber();
      const existing = await SellerBill.findOne({ billNumber });
      if (!existing) exists = false;
    }

    const newBill = new SellerBill({
      orderId: order._id,
      productId: product._id,
      sellerId: order.sellerId,
      billNumber: billNumber,
      amount: commission,
      date: new Date()
    });
    await newBill.save();
  } catch (error) {
    console.error("Error creating seller bill:", error);
  }
};

exports.getSellerBills = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await SellerBill.countDocuments({ sellerId });
    const bills = await SellerBill.find({ sellerId })
      .populate("orderId", "orderNumber totalPrice")
      .populate("productId", "name image price")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      bills,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("❌ Fehler beim Laden der Rechnungen:", error);
    res.status(500).json({ message: "Error fetching bills", error });
  }
};
