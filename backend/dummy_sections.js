const mongoose = require('mongoose');
const Section = require('./models/section');

// Clear existing sections
await Section.deleteMany();

const seedData = async () => {
  try {
    await connectDB();
        // Erstelle Dummy Sections
        const sections = await Section.insertMany([
        {
            offers: [products[0]._id, products[1]._id, products[2]._id, products[3]._id],
            bestOrders: [products[4]._id, products[5]._id, products[6]._id, products[7]._id],
            popularCategories: [products[8]._id, products[9]._id, products[10]._id, products[11]._id],
            banners: [
            { imageUrl: '/images/banners/banner1.jpg', linkUrl: '/promo/sale' },
            { imageUrl: '/images/banners/banner2.jpg', linkUrl: '/promo/new' }
            ]
        },
        // Du kannst weitere Sections hinzufügen
        ]);

    console.log('Dummy data inserted successfully ✅');
    process.exit(); // Exit the script
  } catch (error) {
    console.error('Error inserting dummy data ❌:', error);
    process.exit(1);
  }
};

seedData();