const { Section, Product, Banner, ProductImage } = require('../models');

/**
 * Controller to handle home sections for MySQL
 */
const sectionsController = {
    // Get sections with populated products and banners
    getSections: async (req, res) => {
        try {
            const section = await Section.findOne({
                include: [
                    {
                        model: Product,
                        as: 'offers',
                        include: [{ model: ProductImage, as: 'images' }],
                        through: { attributes: [] }
                    },
                    {
                        model: Product,
                        as: 'bestOrders',
                        include: [{ model: ProductImage, as: 'images' }],
                        through: { attributes: [] }
                    },
                    {
                        model: Product,
                        as: 'popularCategories',
                        include: [{ model: ProductImage, as: 'images' }],
                        through: { attributes: [] }
                    },
                    { model: Banner, as: 'banners' }
                ]
            });
            res.json(section);
        } catch (error) {
            console.error('Error fetching sections:', error);
            res.status(500).json({ error: 'Failed to fetch sections' });
        }
    },

    // Create or update sections
    createSection: async (req, res) => {
        try {
            const section = await Section.create({});
            res.status(201).json(section);
        } catch (error) {
            console.error('Error creating section:', error);
            res.status(500).json({ error: 'Failed to create section' });
        }
    }
};

module.exports = sectionsController;
