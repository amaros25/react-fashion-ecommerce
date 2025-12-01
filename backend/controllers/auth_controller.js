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
      return res.status(400).json({ message: "Benutzer nicht gefunden" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Falsches Passwort" });
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1d" });

    const lastAddress =
      Array.isArray(user.address) && user.address.length > 0
        ? user.address[user.address.length - 1]
        : null;

    const lastPhone =
      Array.isArray(user.phone) && user.phone.length > 0
        ? user.phone[user.phone.length - 1]
        : null;
    console.log("lastPhone : ", lastPhone.phone);
    console.log("lastAddress : ", lastAddress.address);
    console.log("lastAddress : ", lastAddress.city);
    console.log("lastAddress : ", lastAddress.subCity);
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
    res.status(500).json({ message: "Serverfehler" });
  }
};

module.exports = login; // <-- nur so exportieren
