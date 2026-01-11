const { Product, ProductImage, ProductSize, ProductReview, Seller, Order } = require('../models');
const { Op, fn, col } = require('sequelize');

/**
 * Controller to handle product-related operations for MySQL
 */
const productController = {
    // GET: Get top products
    getTopProducts: async (req, res) => {
        try {
            const top_products = await Product.findAll({
                where: { type: 'top' },
                include: [{ model: ProductImage, as: 'images' }]
            });
            res.json(top_products);
        } catch (error) {
            console.error('Error fetching top products:', error);
            res.status(500).json({ error: 'Failed to fetch top products' });
        }
    },

    // GET: Get new products with filter, search and pagination
    getNewProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const category = req.query.category !== undefined ? Number(req.query.category) : null;
            const subcategory = req.query.subcategory !== undefined ? Number(req.query.subcategory) : null;
            const search = req.query.search;
            const not = req.query.not;
            const sortBy = req.query.sort || 'newest';
            const offset = (page - 1) * limit;

            const where = {};
            if (category !== null && !isNaN(category)) where.category = category;
            if (subcategory !== null && !isNaN(subcategory)) where.subcategory = subcategory;
            if (not) where.id = { [Op.ne]: not };
            if (search) {
                const searchWords = search.trim().split(/\s+/);
                where[Op.and] = searchWords.map(word => ({
                    name: { [Op.like]: `%${word}%` }
                }));
            }

            let order = [];
            if (sortBy === 'price_asc') {
                order = [['price', 'ASC']];
            } else if (sortBy === 'price_desc') {
                order = [['price', 'DESC']];
            } else if (sortBy === 'rating') {
                // Complex sorting by avg rating and createdAt
                // For now, let's keep it simple or use literal
                order = [[fn('AVG', col('reviews.rating')), 'DESC'], ['createdAt', 'DESC']];
            } else {
                order = [['createdAt', 'DESC']];
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                offset,
                limit,
                order,
                include: [
                    { model: ProductImage, as: 'images' },
                    { model: ProductReview, as: 'reviews', attributes: [] } // Just for joins if needed
                ],
                distinct: true
            });

            const totalAllProducts = await Product.count();

            res.json({
                products: rows,
                page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                totalAllProducts
            });
        } catch (error) {
            console.error('Error fetching latest products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    // GET: Get a single product by ID
    getProductByID: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [
                    { model: ProductImage, as: 'images' },
                    { model: ProductSize, as: 'sizes' },
                    { model: ProductReview, as: 'reviews' }
                ]
            });
            if (!product) return res.status(404).json({ error: 'product_not_found' });
            res.json(product);
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    },

    // GET: Get products by IDs
    getProductsByIDs: async (req, res) => {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ message: "missing_product_ids" });
        const productIds = ids.split(',');

        try {
            const products = await Product.findAll({
                where: { id: { [Op.in]: productIds } },
                include: [{ model: ProductImage, as: 'images' }]
            });
            if (products.length === 0) return res.status(404).json({ message: "product_not_found" });
            res.json(products);
        } catch (err) {
            console.error('Error fetching products by IDs:', err);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get products by Seller ID
    getProductBySellerID: async (req, res) => {
        const { sellerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search?.trim() || "";
        const offset = (page - 1) * limit;

        try {
            const where = { sellerId };
            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { productNumber: { [Op.like]: `%${search}%` } }
                ];
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                offset,
                limit,
                order: [['createdAt', 'DESC']],
                include: [{ model: ProductImage, as: 'images' }],
                distinct: true
            });

            res.json({
                products: rows,
                totalCount: count,
                page,
                totalPages: Math.ceil(count / limit),
            });
        } catch (error) {
            console.error("Error fetching seller products:", error);
            res.status(500).json({ message: "error_fetching_products" });
        }
    },

    // POST: Create a new product
    createProduct: async (req, res) => {
        const { sellerId, name, description, price, delprice, category, subcategory, type, images, sizes } = req.body;
        const { sequelize } = require('../models');
        const t = await sequelize.transaction();

        try {
            const product = await Product.create({
                sellerId,
                productNumber: `PR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                name,
                description,
                price,
                delprice,
                category,
                subcategory,
                type
            }, { transaction: t });

            if (images && images.length > 0) {
                await ProductImage.bulkCreate(
                    images.map(url => ({ productId: product.id, url })),
                    { transaction: t }
                );
            }

            if (sizes && sizes.length > 0) {
                await ProductSize.bulkCreate(
                    sizes.map(s => ({ ...s, productId: product.id })),
                    { transaction: t }
                );
            }

            await t.commit();
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            await t.rollback();
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'error_adding_product' });
        }
    },

    // POST: Add a new Review
    addReview: async (req, res) => {
        const productId = req.params.id;
        const { userId, rating, comment } = req.body;

        try {
            // Check if user already reviewed this product
            const existingReview = await ProductReview.findOne({
                where: { productId, userId }
            });

            if (existingReview) {
                return res.status(400).json({ message: "review_already_exists_error" });
            }

            const review = await ProductReview.create({
                productId,
                userId,
                rating,
                comment
            });

            // Fetch all reviews to return
            const allReviews = await ProductReview.findAll({ where: { productId } });

            res.json({ message: "success_add_review", reviews: allReviews });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "failed_to_add_review_error" });
        }
    }
};

module.exports = productController;
