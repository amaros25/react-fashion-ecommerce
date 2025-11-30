const Seller = require("../models/seller.js");
const bcrypt = require("bcryptjs");

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sellers", error: err });
  }
};

// Get seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (seller.address && seller.address.length > 1) {
      seller.address = seller.address[seller.address.length - 1];
    }
    if (seller.phone && seller.phone.length > 1) {
      seller.phone = seller.phone[seller.phone.length - 1];
    }

    res.json(seller);
  } catch (err) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const sellerAddress = address ? address.map(a => ({
      address: a.address,
      city: a.city,
      dateModified: Date.now(),
    })) : [];

    const sellerPhone = phone ? phone.map(p => ({
      phone: p.phone,
      dateModified: Date.now(),
    })) : [];

    const newSeller = new Seller({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      shopName,
      address: sellerAddress,
      phone: sellerPhone,
      image,
      reviews: []
    });
    await newSeller.save();
    res.status(201).json({ message: "Seller created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
