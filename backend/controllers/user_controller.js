// backend/controllers/user_controller.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Alle Benutzer abrufen
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

// Einzelnen Benutzer nach ID abrufen
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;
    console.log("firstName", firstName);
    console.log("lastName", lastName);
    console.log("email", email);
    console.log("password", password);
    console.log("phone", phone);
    console.log("address", address);

    let phoneNumber = null;
    if (Array.isArray(phone) && phone.length > 0) {
      phoneNumber = phone[0].phone;
    } else if (typeof phone === 'object' && phone.phone) {
      phoneNumber = phone.phone;
    } else {
      phoneNumber = phone;
    }
    const existingUser = await User.findOne({
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


    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone,
      address: address,
    });

    await newUser.save();

    res.status(201).json({ message: "user created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// Adresse und Telefonnummer des Users aktualisieren
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { address, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
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
      message: "user updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
      error: err.message,
    });
  }
};
