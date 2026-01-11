const { Section, Banner, SectionProduct, Product, sequelize } = require('./models');

const seedSections = async () => {
    try {
        // Find some existing products from previous seed
        const products = await Product.findAll({ limit: 4 });

        if (products.length === 0) {
            console.log('No products found. Please run seed_sql.js first.');
            return;
        }

        // 1. Create a Section
        const section = await Section.create();

        // 2. Create Banners
        await Banner.bulkCreate([
            {
                sectionId: section.id,
                imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
                linkUrl: '/home/clothing/all'
            },
            {
                sectionId: section.id,
                imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=1200',
                linkUrl: '/home/shoes/all'
            }
        ]);

        // 3. Link products to section
        await SectionProduct.bulkCreate(
            products.map((p, i) => ({
                sectionId: section.id,
                productId: p.id,
                type: i % 2 === 0 ? 'offer' : 'bestOrder'
            }))
        );

        console.log('Sections and Banners seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed sections:', error);
        process.exit(1);
    }
};

seedSections();
