const Seller = require("../models/seller.js");
const bcrypt = require("bcryptjs");

// Get all sellers

exports.getSellerByIds = async (req, res) => {
  try {
    const ids = req.query.ids.split(",");
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "SellerIds muss be an Array" });
    }
    const sellers = await Seller.find({ _id: { $in: ids } });

    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
