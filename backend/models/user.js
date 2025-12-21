const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: [
    {
      address: { type: String, required: true },
      city: { type: Number, required: true },
      subCity: { type: Number, required: true },
      dateModified: { type: Date, default: Date.now }
    }
  ],
  phone: [
    {
      phone: { type: Number, required: true },
      dateModified: { type: Date, default: Date.now }
    }
  ],
  active: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  lastOnline: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);