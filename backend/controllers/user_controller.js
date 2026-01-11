// backend/controllers/user_controller.js
const User = require("../models/user");
const Seller = require("../models/seller");
const bcrypt = require("bcryptjs");

// Alle Benutzer abrufen
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "server_error" });
  }
};

// Einzelnen Benutzer nach ID abrufen
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "user_not_found" });
    let lastAddress = "";
    let lastPhone = "";
    if (Array.isArray(user.address) && user.address.length > 0) {
      lastAddress = user.address[user.address.length - 1];
    } else {
      lastAddress = "";
    }
    if (Array.isArray(user.phone) && user.phone.length > 0) {
      lastPhone = user.phone[user.phone.length - 1];
    } else {
      lastPhone = "";
    }
    let lastImage = "";
    if (Array.isArray(user.image) && user.image.length > 0) {
      lastImage = user.image[user.image.length - 1];
    } else {
      lastImage = "";
    }
    res.json({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: lastPhone.phone,
      address: lastAddress.address,
      city: lastAddress.city,
      subCity: lastAddress.subCity,
      active: user.active,
      image: lastImage.imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "server_error" });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, active, lastOnline } = req.body;
    console.log(req.body);
    if (!firstName || !lastName || !email || !password || !phone || !address) {
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone,
      address: address,
      active: active,
      lastOnline: lastOnline,
    });
    await newUser.save();
    res.status(201).json({ message: "user_created_successfully", userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "register_user_failed" });
  }
};

// Adresse und Telefonnummer des Users aktualisieren
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { address, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user_not_found" });
    }

    // Push new address to array
    if (address) {
      user.address.push({
        address: address.address,
        city: address.city,
        subCity: address.subCity,
        dateModified: new Date()
      });
    }

    // Push new phone to array
    if (phone) {
      user.phone.push({
        phone: phone,
        dateModified: new Date()
      });
    }

    await user.save();

    res.status(200).json({
      message: "user_updated_successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server_error",
      error: err.message,
    });
  }
};

exports.updateUserImage = async (req, res) => {
  try {
    console.log("updateUserImage");
    const userId = req.params.id;
    const { imageUrl } = req.body;
    console.log("updateUserImage imageUrl: ", imageUrl);
    const user = await User.findById(userId);
    console.log("updateUserImage user: ", user);
    if (!user) {
      return res.status(404).json({ message: "user_not_found" });
    }
    user.image.push({
      imageUrl: imageUrl,
      dateModified: new Date()
    });
    await user.save();
    res.status(200).json({
      message: "user_image_updated_successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "user_image_update_failed",
      error: err.message,
    });
  }
};