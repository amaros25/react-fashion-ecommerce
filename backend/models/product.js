const mongoose = require('mongoose');

const productShema = new mongoose.Schema({
    sellerId: {type: mongoose.Schema.Types.ObjectId, ref: 'sellers' },
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: [{type: String, required: true}], // Strings Array
    category: {type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    type: {type: String, required: true},
    rating: { type: Number, default: 0 },
    sizes: [
        {
            size: { type: String, required: true }, // Like "M", "L", "34", "36"
            stock: { type: Number, required: true, default: 0 },
        },
    ],
   // isDiscounted: {type: Boolean, default: false},
   discountedPercent: {type: Number, default: 0}
});

module.exports = mongoose.model('Product', productShema)