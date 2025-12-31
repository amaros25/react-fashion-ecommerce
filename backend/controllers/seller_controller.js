const Seller = require("../models/seller.js");
const SellerReview = require("../models/seller_review.js");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Get all sellers

exports.getSellerByIds = async (req, res) => {
  try {
    const ids = req.query.ids.split(",");
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "SellerIds must be an Array" });
    }

    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    // Get sellers and their ratings
    const sellers = await Seller.aggregate([
      { $match: { _id: { $in: objectIds } } },
      {
        $lookup: {
          from: "sellerreviews", // name of the SellerReview collection
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
          reviews: 0, // remove the joined reviews array
          password: 0 // security
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

    // Calculate ratings
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
    const { firstName, lastName, email, password, shopName, address, phone, image } = req.body;
    if (!firstName || !lastName || !email || !password || !shopName || !address || !phone || !image) {
      return res.status(400).json({ message: "Data is missing" });
    }


    let phoneNumber = null;
    if (Array.isArray(phone) && phone.length > 0) {
      phoneNumber = phone[0].phone;
    } else if (typeof phone === 'object' && phone.phone) {
      phoneNumber = phone.phone;
    } else {
      phoneNumber = phone;
    }
    const existingUser = await Seller.findOne({
      $or: [
        { email },
        { 'phone.phone': phoneNumber },
      ]
    });

    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const newSeller = new Seller({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone,
      address: address,

      firstName,
      lastName,
      email,
      password: hashedPassword,
      shopName,
      address: address,
      phone: phone,
      image,
    });

    await newSeller.save();

    res.status(201).json({ message: "user created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
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
      // Add new address to the array
      seller.address.push({
        address: address.address,
        city: address.city,
        subCity: address.subCity,
        dateModified: new Date()
      });
    }

    if (phone) {
      // Add new phone to the array
      seller.phone.push({
        phone: phone,
        dateModified: new Date()
      });
    }

    await seller.save();

    // Return the updated seller with the latest address/phone
    // We need to re-fetch or manually construct the response to match getSellerById format if needed
    // But for now, returning the updated seller object is fine. 
    // Ideally we return the specific updated fields or the whole object.

    // Let's format it similar to getSellerById for consistency on the frontend if it expects the "latest" one flattened
    // But getSellerById flattens it. Here we return the raw object usually, but let's just return the full updated doc.

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

    // One review per order
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
