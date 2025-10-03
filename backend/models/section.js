const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  offers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],         // Array with 4 Product-IDs
  bestOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],     // Array with 4 Product-IDs
  popularCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Array with 4 Product-IDs
  
  banners: [ // Array von Banner-Objekten
    {
      imageUrl: { type: String, required: true },  // Path to Banner Pohots
      linkUrl: { type: String, required: true }    // Link that opens when the banner is clicked
    }
  ]
});

module.exports = mongoose.model('Section', sectionSchema);