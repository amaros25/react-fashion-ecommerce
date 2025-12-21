const User = require("../models/user");
const Seller = require("../models/seller.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "DEIN_SECRET_KEY";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    let role = "shoper";

    if (!user) {
      user = await Seller.findOne({ email });
      role = "seller";
    }

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    // Check if user is already logged in
    if (user.isLoggedIn) {
      return res.status(403).json({
        message: "User already logged in on another device. Please logout from the other device first.",
        error: "ALREADY_LOGGED_IN"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "wrong password" });
    }

    // Set isLoggedIn to true
    user.isLoggedIn = true;
    await user.save();

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1d" });

    let lastAddress = {};
    if (Array.isArray(user.address) && user.address.length > 0) {
      lastAddress = user.address[user.address.length - 1];
    }

    let lastPhone = {};
    if (Array.isArray(user.phone) && user.phone.length > 0) {
      lastPhone = user.phone[user.phone.length - 1];
    }

    res.json({
      token,
      role,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: lastPhone.phone || "",
      address: lastAddress.address || "",
      city: lastAddress.city || "",
      subCity: lastAddress.subCity || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

const logout = async (req, res) => {

  console.log("Logout requested for body:", req.body);
  const { userId, role } = req.body;
  console.log("Logout requested for userId:", userId);
  try {
    let user;
    if (role == 1) {
      user = await User.findById(userId);
    }
    if (role == 2) {
      user = await Seller.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (user) {
      user.isLoggedIn = false;
      await user.save();
      res.json({ message: "Logged out successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

module.exports = { login, logout };
