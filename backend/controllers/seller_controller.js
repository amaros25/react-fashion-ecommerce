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

    if (seller.address && seller.address.length > 0) {
      seller.address = seller.address[seller.address.length - 1];
    }
    if (seller.phone && seller.phone.length > 0) {
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
      reviews: []
    });

    await newSeller.save();

    res.status(201).json({ message: "user created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};
