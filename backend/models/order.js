const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

  sizes: [
    {
      size: { type: String, required: true }, 
      quantity: { type: Number, required: true, default: 1 },
    }
  ],

  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  trackingNumber: { type: String },
  paymentMethod: { type: String },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  rating: { type: Number, default: 0 },
  status: [
    {
      date: { type: Date, default: Date.now },
      update: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
    }
  ],
  order_coupon: { type: String },
  notes: { type: String },
});

module.exports = mongoose.model('Order', orderSchema)