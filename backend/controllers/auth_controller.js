const User = require("../models/user");
const Seller = require("../models/seller.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");

const JWT_SECRET = "DEIN_SECRET_KEY";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const identifier = email; // Input can be email or phone
    let user = await User.findOne({ email: identifier });
    let role = "shoper";

    // If not found by email, try phone
    if (!user) {
      const phoneNum = Number(identifier);
      if (!isNaN(phoneNum)) {
        // Find users who have this phone number
        const usersWithPhone = await User.find({ "phone.phone": phoneNum });
        // Check if it is the LAST (current) phone number
        user = usersWithPhone.find(u =>
          u.phone && u.phone.length > 0 && u.phone[u.phone.length - 1].phone === phoneNum
        );
      }
    }

    if (user) {
      role = user.role || "shoper";
    }

    // Check Seller if NOT found in User
    if (!user) {
      user = await Seller.findOne({ email: identifier });
      role = "seller";

      // If not found by email, try phone for Seller
      if (!user) {
        const phoneNum = Number(identifier);
        if (!isNaN(phoneNum)) {
          const sellersWithPhone = await Seller.find({ "phone.phone": phoneNum });
          user = sellersWithPhone.find(s =>
            s.phone && s.phone.length > 0 && s.phone[s.phone.length - 1].phone === phoneNum
          );
          if (user) role = "seller";
        }
      }
    }

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "wrong password" });
    }

    await user.save();

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1d" });

    let lastAddress = {};
    if (Array.isArray(user.address) && user.address.length > 0) {
      lastAddress = user.address[user.address.length - 1];
    }
    console.log("login address: ", lastAddress.address);
    console.log("login city: ", lastAddress.city);
    console.log("login subCity: ", lastAddress.subCity);
    let lastPhone = {};
    if (Array.isArray(user.phone) && user.phone.length > 0) {
      lastPhone = user.phone[user.phone.length - 1];
    }
    console.log("login lastPhone: ", lastPhone);

    res.json({
      token,
      role,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: lastPhone.phone,
      address: lastAddress.address,
      city: lastAddress.city,
      subCity: lastAddress.subCity,
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

// Request password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  console.log("Password reset requested for email:", email);
  try {
    // Find user in both collections
    let user = await User.findOne({ email });
    let role = "user";

    if (!user) {
      user = await Seller.findOne({ email });
      role = "seller";
    }

    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ message: "If email exists, reset link sent" });
    }
    console.log("User found for email:", email);
    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log("Reset token generated:", resetToken);
    // Hash token before storing (security best practice)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log("Hashed token generated:", hashedToken);
    // Set token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    console.log("User password reset token set:", user.passwordResetToken);
    console.log("User password reset expires set:", user.passwordResetExpires);
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken);
    console.log("Password reset email sent to:", email);
    res.json({ message: "Password reset email sent" });
    console.log("Password reset email sent to:", email);
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    let user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    let role = "user";
    if (!user) {
      user = await Seller.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      role = "seller";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

const updateLastOnline = async (req, res) => {
  const { userId, role } = req.body;
  try {
    let user;
    // Role check: Admin (undefined or "admin") is technically a user in our DB logic mostly, 
    // but let's assume standard "shoper" or "seller" roles strings or IDs.
    // The helper passing role might pass the string "shoper", "seller", "admin".

    if (role === 'seller') {
      user = await Seller.findById(userId);
    } else {
      // "shoper", "admin" are in User collection
      user = await User.findById(userId);
    }

    if (user) {
      user.lastOnline = Date.now();
      await user.save();
      res.json({ message: "Last online updated" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating last online:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { login, logout, requestPasswordReset, resetPassword, updateLastOnline };
