const { User, Seller, Product, ProductImage, ProductSize, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); // DANGER: Drops all tables
        console.log('Database synced (all tables dropped and recreated)');

        const hashedUserPassword = await bcrypt.hash('user123', 10);
        const hashedSellerPassword = await bcrypt.hash('seller123', 10);

        // 1. Create Users
        const user1 = await User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'user@example.com',
            password: hashedUserPassword,
            role: 'user'
        });

        // 2. Create Sellers
        const seller1 = await Seller.create({
            name: 'Fashion Hub',
            email: 'seller@example.com',
            password: hashedSellerPassword,
            phone: '123456789',
            address: '123 Street, City',
            companyName: 'Fashion Hub Ltd',
            role: 'seller'
        });

        // 3. Create Products
        const product1 = await Product.create({
            sellerId: seller1.id,
            productNumber: 'PR-A1001',
            name: 'Classic White T-Shirt',
            description: 'A premium cotton classic white t-shirt.',
            price: 19.99,
            delprice: 25.00,
            category: 1, // e.g., Clothing
            subcategory: 10, // e.g., T-Shirts
            type: 'Cotton',
            discountedPercent: 20
        });

        const product2 = await Product.create({
            sellerId: seller1.id,
            productNumber: 'PR-B2002',
            name: 'Blue Denim Jeans',
            description: 'Stylish slim-fit blue denim jeans.',
            price: 49.99,
            delprice: 60.00,
            category: 1,
            subcategory: 11, // e.g., Jeans
            type: 'Denim',
            discountedPercent: 15
        });

        // 4. Add Images
        await ProductImage.bulkCreate([
            { productId: product1.id, url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800' },
            { productId: product2.id, url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800' }
        ]);

        // 5. Add Sizes
        await ProductSize.bulkCreate([
            { productId: product1.id, size: 'M', stock: 50, color: 'White' },
            { productId: product1.id, size: 'L', stock: 30, color: 'White' },
            { productId: product2.id, size: '32', stock: 20, color: 'Blue' },
            { productId: product2.id, size: '34', stock: 15, color: 'Blue' }
        ]);

        console.log('Seed data inserted successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed database:', error);
        process.exit(1);
    }
};

seedDatabase();
