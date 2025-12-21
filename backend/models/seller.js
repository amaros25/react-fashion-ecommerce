const mongoose = require('mongoose');

const sellerReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now }
});

const sellerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  shopName: { type: String, required: true },
  address: [
    {
      address: { type: String, required: true },
      city: { type: Number, required: true },
      subCity: { type: Number, required: true },
      dateModified: { type: Date, default: Date.now }
    }
  ],
  image: { type: String, required: true },
  phone: [
    {
      phone: { type: Number, required: true },
      dateModified: { type: Date, default: Date.now }
    }
  ],
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  reviews: [sellerReviewSchema],
  active: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  lastOnline: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Seller', sellerSchema);
