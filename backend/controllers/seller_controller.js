const Seller = require("../models/seller.js");
const bcrypt = require("bcryptjs");

// Alle Seller abrufen (optional)
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sellers", error: err });
  }
};

// Einzelnen Seller abrufen (optional)
exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller nicht gefunden" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: "Error fetching seller", error: err });
  }
};

// Seller erstellen
exports.createSeller = async (req, res) => {
  try {
    const { firstName, lastName, email, password, shopName, address, image } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new Seller({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      shopName,
      address,
      image
    });

    await newSeller.save();
    res.status(201).json({ message: "Seller erstellt" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler" });
  }
};
