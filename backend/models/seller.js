const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  shopName: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  phone: { type: Number, default: 0 },
  email: { type: String, required: true, unique: true }, // <-- hinzufügen
  password: { type: String, required: true },           // <-- hinzufügen
});

module.exports = mongoose.model('Seller', sellerSchema);