const mongoose = require("mongoose");

// 🔢 Hilfsfunktion zur Generierung einer eindeutigen Produktnummer
function generateProductNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-stellig
  return `PR-${randomLetter}${randomNum}`; // z.B. PR-A47291
}

// 📝 Review Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 🛒 Produkt Schema
const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "sellers", required: true },
  productNumber: { type: String, unique: true, required: true },

  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  delprice: { type: Number, required: true },
  image: [{ type: String, required: true }],
  category: { type: Number, required: true },
  subcategory: { type: Number, required: true },
  type: { type: String, required: false },
  reviews: [reviewSchema],
  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, required: true, default: 0 },
      color: { type: String, required: true },
    },
  ],
  discountedPercent: { type: Number, default: 0 },
  states: [{
    state: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
  }
  ]
});

// ⚙️ Automatisch Produktnummer generieren, wenn keine vorhanden ist
productSchema.pre("validate", async function (next) {
  if (!this.productNumber) {
    let newNumber;
    let exists = true;

    while (exists) {
      newNumber = generateProductNumber();
      const existing = await mongoose.models.Product.findOne({ productNumber: newNumber });
      if (!existing) exists = false;
    }

    this.productNumber = newNumber;
    // console.log('OrderController validate: productNumber: ', productNumber);
  }
  next();
});




module.exports = mongoose.model("Product", productSchema);
