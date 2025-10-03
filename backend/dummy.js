// backend/dummy.js

const mongoose = require('mongoose');
const connectDB = require('./db'); // reuse your DB connection
const Product = require('./models/product');
const Seller = require('./models/seller');
const Section = require('./models/section');

const seedData = async () => {
  try {
    await connectDB();

    // Optional: Clear collections before inserting
    await Product.deleteMany();
    await Seller.deleteMany();
    await Section.deleteMany();
 
    // Dummy sellers
    const sellers = await Seller.insertMany([
    {
        firstName: 'Ali',
        lastName: 'Khan',
        shopName: 'Ali Fashion',
        address: 'Berlin, Germany',
        image: '/images/seller1.jpg',
        rating: 4.8
    },
    {
        firstName: 'Emma',
        lastName: 'Dupont',
        shopName: 'Paris Style',
        address: 'Paris, France',
        image: '/images/seller2.jpg',
        rating: 4.5
    },
    {
        firstName: 'Luca',
        lastName: 'Bianchi',
        shopName: 'Milano Moda',
        address: 'Milan, Italy',
        image: '/images/seller3.jpg',
        rating: 4.7
    }
    ]);

    // Dummy products
     const products = await Product.insertMany([
    {
        sellerId: sellers[0]._id,
        name: 'Elegant Summer Dress',
        description: 'Light and airy summer dress, perfect for warm days.',
        price: 49.99,
        image: ['/images/products/product1.jpg'],
        category: 'Vêtements pour femme',
        type: 'top',
        rating: 4.5,
        sizes: [
        { size: 'S', stock: 10 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 5 },
        ],
    },
    {
        sellerId: sellers[1]._id,
        name: 'Classic Men’s Shirt',
        description: 'Slim-fit shirt with breathable fabric.',
        price: 39.99,
        image: ['/images/products/product2.jpg'],
        category: 'Vêtements pour homme',
        type: 'top',
        rating: 4.3,
        sizes: [
        { size: 'M', stock: 12 },
        { size: 'L', stock: 6 },
        { size: 'XL', stock: 3 },
        ],
    },
    {
        sellerId: sellers[2]._id,
        name: 'Kids Sneakers',
        description: 'Durable sneakers for active kids.',
        price: 29.99,
        image: ['/images/products/product3.jpg'],
        category: 'Vêtements pour enfants',
        type: 'top',
        rating: 4.6,
        sizes: [
        { size: '28', stock: 15 },
        { size: '30', stock: 10 },
        ],
    },
    // 4
    {
        sellerId: sellers[0]._id,
        name: 'Cozy Winter Jacket',
        description: 'Warm and comfortable jacket for cold weather.',
        price: 89.99,
        image: ['/images/products/product4.jpg'],
        category: 'Vêtements pour homme',
        type: 'top',
        rating: 4.7,
        sizes: [
        { size: 'M', stock: 7 },
        { size: 'L', stock: 3 },
        { size: 'XL', stock: 2 },
        ],
    },
    // 5
    {
        sellerId: sellers[1]._id,
        name: 'Stylish Women’s Handbag',
        description: 'Elegant handbag made from genuine leather.',
        price: 120.0,
        image: ['/images/products/product5.jpg'],
        category: 'Accessoires',
        type: 'top',
        rating: 4.9,
    },
    // 6
    {
        sellerId: sellers[2]._id,
        name: 'Running Shoes',
        description: 'Lightweight running shoes for daily workouts.',
        price: 59.99,
        image: ['/images/products/product6.jpg'],
        category: 'Chaussures',
        type: 'top',
        rating: 4.4,
        sizes: [
        { size: '40', stock: 10 },
        { size: '41', stock: 8 },
        { size: '42', stock: 5 },
        ],
    },
    // 7
    {
        sellerId: sellers[0]._id,
        name: 'Kids T-shirt',
        description: 'Comfortable cotton t-shirt for kids.',
        price: 14.99,
        image: ['/images/products/product7.jpg'],
        category: 'Vêtements pour enfants',
        type: 'top',
        rating: 4.2,
        sizes: [
        { size: 'S', stock: 20 },
        { size: 'M', stock: 15 },
        ],
    },
    // 8
    {
        sellerId: sellers[1]._id,
        name: 'Elegant Evening Gown',
        description: 'Perfect gown for special occasions.',
        price: 199.99,
        image: ['/images/products/product8.jpg'],
        category: 'Vêtements pour femme',
        type: 'top',
        rating: 4.8,
        sizes: [
        { size: 'M', stock: 4 },
        { size: 'L', stock: 3 },
        ],
    },
    // 9
    {
        sellerId: sellers[2]._id,
        name: 'Casual Sneakers',
        description: 'Everyday sneakers for casual use.',
        price: 49.99,
        image: ['/images/products/product9.jpg'],
        category: 'Chaussures',
        type: 'top',
        rating: 4.1,
        sizes: [
        { size: '39', stock: 12 },
        { size: '40', stock: 10 },
        ],
    },
    // 10
    {
        sellerId: sellers[0]._id,
        name: 'Leather Belt',
        description: 'High-quality leather belt.',
        price: 25.99,
        image: ['/images/products/product10.jpg'],
        category: 'Accessoires',
        type: 'top',
        rating: 4.5,
    },
    // 11
    {
        sellerId: sellers[1]._id,
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans.',
        price: 59.99,
        image: ['/images/products/product11.jpg'],
        category: 'Vêtements pour homme',
        type: 'top',
        rating: 4.3,
        sizes: [
        { size: 'M', stock: 10 },
        { size: 'L', stock: 7 },
        { size: 'XL', stock: 5 },
        ],
    },
    // 12
    {
        sellerId: sellers[2]._id,
        name: 'Summer Hat',
        description: 'Light hat to protect from the sun.',
        price: 19.99,
        image: ['/images/products/product12.jpg'],
        category: 'Accessoires',
        type: 'top',
        rating: 4.0,
    },
    // 13
    {
        sellerId: sellers[0]._id,
        name: 'Kids Jacket',
        description: 'Warm jacket for kids.',
        price: 39.99,
        image: ['/images/products/product13.jpg'],
        category: 'Vêtements pour enfants',
        type: 'top',
        rating: 4.6,
        sizes: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        ],
    },
    // 14
    {
        sellerId: sellers[1]._id,
        name: 'Elegant Scarf',
        description: 'Silky scarf for elegant looks.',
        price: 29.99,
        image: ['/images/products/product14.jpg'],
        category: 'Accessoires',
        type: 'top',
        rating: 4.7,
    },
    // 15
    {
        sellerId: sellers[2]._id,
        name: 'Formal Shoes',
        description: 'Perfect for business and formal occasions.',
        price: 89.99,
        image: ['/images/products/product15.jpg'],
        category: 'Chaussures',
        type: 'top',
        rating: 4.5,
        sizes: [
        { size: '42', stock: 6 },
        { size: '43', stock: 4 },
        ],
    },
    // 16
    {
        sellerId: sellers[0]._id,
        name: 'Beach Sandals',
        description: 'Comfortable sandals for the beach.',
        price: 19.99,
        image: ['/images/products/product16.jpg'],
        category: 'Chaussures',
        type: 'top',
        rating: 4.3,
        sizes: [
        { size: '38', stock: 15 },
        { size: '39', stock: 10 },
        ],
    },
    // 17
    {
        sellerId: sellers[1]._id,
        name: 'Men’s Hoodie',
        description: 'Casual hoodie for men.',
        price: 34.99,
        image: ['/images/products/product17.jpg'],
        category: 'Vêtements pour homme',
        type: 'top',
        rating: 4.4,
        sizes: [
        { size: 'M', stock: 8 },
        { size: 'L', stock: 6 },
        ],
    },
    // 18
    {
        sellerId: sellers[2]._id,
        name: 'Women’s Blouse',
        description: 'Light and comfortable blouse.',
        price: 29.99,
        image: ['/images/products/product18.jpg'],
        category: 'Vêtements pour femme',
        type: 'top',
        rating: 4.3,
        sizes: [
        { size: 'S', stock: 7 },
        { size: 'M', stock: 5 },
        ],
    },
    // 19
    {
        sellerId: sellers[0]._id,
        name: 'Backpack',
        description: 'Durable backpack for everyday use.',
        price: 59.99,
        image: ['/images/products/product19.jpg'],
        category: 'Accessoires',
        type: 'top',
        rating: 4.6,
    },
    // 20
    {
        sellerId: sellers[1]._id,
        name: 'Sports Watch',
        description: 'Water-resistant sports watch with multiple functions.',
        price: 99.99,
        image: ['/images/products/product20.jpg'],
        category: 'Accessoires',
        type: 'top',
        rating: 4.7,
    },
    ]);




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
    ]);

    console.log('Dummy data inserted successfully ✅');
    process.exit(); // Exit the script
  } catch (error) {
    console.error('Error inserting dummy data ❌:', error);
    process.exit(1);
  }
};

seedData();
