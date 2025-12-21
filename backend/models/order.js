const mongoose = require('mongoose');


// kleine Hilfsfunktion zur Generierung
function generateOrderNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-stellig
  return `${randomLetter}${randomNum}`; // z.B. A47291
}

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      color: { type: String, required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],

  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },

  trackingNumber: { type: String },
  paymentMethod: { type: String },
  is_delivery: { type: Boolean, default: true },

  status: [
    {
      date: { type: Date, default: Date.now },
      update: { type: Number, default: 0 }
    }
  ],
  order_coupon: { type: String },
  notes: { type: String },
});

orderSchema.pre("validate", async function (next) {
  if (!this.orderNumber) {
    let newNumber;
    let exists = true;

    // Schleife: sicherstellen, dass keine doppelte Nummer entsteht
    while (exists) {
      newNumber = generateOrderNumber();
      const existing = await mongoose.models.Order.findOne({ orderNumber: newNumber });
      if (!existing) exists = false;
    }

    this.orderNumber = newNumber;
  }
  next();
});


module.exports = mongoose.model('Order', orderSchema)