const { Product, ProductReview, UserStats, ProductVariant } = require('../models');
const { sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');




const validateProductData = (data) => {
    const {
        sellerId, name, description, price, delprice,
        category, subcategory, images, variants
    } = data;

    // 1. Check auf Existenz (Nicht null/undefined)
    if (!sellerId || !name || !description || price === undefined || delprice === undefined ||
        category === undefined || subcategory === undefined) {
        return { isValid: false, message: "missing_required_fields" };
    }
    if (isNaN(category) || isNaN(subcategory)) {
        return { isValid: false, message: "category_must_be_number" };
    }

    // 3. Zahlen validieren (Dinar Preise)
    if (isNaN(price) || Number(price) <= 0) return { isValid: false, message: "invalid_price" };
    if (isNaN(delprice) || Number(delprice) < 0) return { isValid: false, message: "invalid_delivery_price" };

    // 4. Arrays validieren (Images & Variants)
    if (!Array.isArray(images) || images.length === 0) {
        return { isValid: false, message: "at_least_one_image_required" };
    }

    if (!Array.isArray(variants) || variants.length === 0) {
        return { isValid: false, message: "at_least_one_variant_required" };
    }

    // 5. Deep Check: Varianten-Struktur validieren
    const seenVariants = new Set();
    for (const v of variants) {
        const key = `${v.size}-${v.color}`.toLowerCase();
        if (seenVariants.has(key)) {
            return { isValid: false, message: "duplicate_variant_size_color_combination" };
        }
        seenVariants.add(key);
        if (!v.size || !v.color || v.stock === undefined || v.stock <= 0) {
            return { isValid: false, message: "invalid_variant_structure_or_stock" };
        }
    }
    return { isValid: true };
};

/**
 * Controller to handle product-related operations for MySQL
 */
const productController = {


    // GET: Get new products with filter, search and pagination
    getNewProducts: async (req, res) => {
        try {
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
            const category = req.query.category !== undefined ? Number(req.query.category) : null;
            const subcategory = req.query.subcategory !== undefined ? Number(req.query.subcategory) : null;
            const search = req.query.search;
            const not = req.query.not ? parseInt(req.query.not) : null;
            const sortBy = req.query.sort || 'newest';
            const offset = (page - 1) * limit;
            const where = { status: 1 }; // Only Active Products

            if (category !== null && !isNaN(category)) where.category = category;
            if (subcategory !== null && !isNaN(subcategory)) where.subcategory = subcategory;
            if (not) where.id = { [Op.ne]: not };

            if (search) {
                const searchWords = search.trim().split(/\s+/);
                where[Op.and] = searchWords.map(word => ({
                    name: { [Op.iLike]: `%${word}%` }
                }));
            }

            let order = [];
            switch (sortBy) {
                case 'price_asc':
                    order = [['price', 'ASC']];
                    break;
                case 'price_desc':
                    order = [['price', 'DESC']];
                    break;
                case 'rating':
                    order = [['avgRating', 'DESC'], ['createdAt', 'DESC']];
                    break;
                default:
                    order = [['createdAt', 'DESC']];
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                offset,
                limit,
                order,
                distinct: true,
                include: [
                    {
                        model: ProductVariant,
                        as: 'variants',
                        attributes: ['id', 'size', 'color', 'stock']
                    }
                ]
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
            res.status(500).json({ error: 'server_error_fetching_latest_products' });
        }
    },


    // GET: Get a single product by ID
    getProductByID: async (req, res) => {
        try {
            const { id } = req.params;
            const productId = parseInt(id, 10);
            if (isNaN(productId) || productId <= 0) {
                return res.status(400).json({ error: 'invalid_product_id_format' });
            }
            const product = await Product.findByPk(productId, {
                include: [
                    { model: ProductReview, as: 'reviews', limit: 10, order: [['created_at', 'DESC']] },
                    { model: ProductVariant, as: 'variants' }
                ]
            });

            if (!product) {
                return res.status(404).json({ error: 'product_not_found' });
            }

            res.json(product);
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            res.status(500).json({ error: 'server_error_fetching_product_by_id' });
        }
    },

    // GET: Get products by IDs
    getProductsByIDs: async (req, res) => {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ message: "missing_product_ids" });
        const productIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        try {
            const products = await Product.findAll({
                where: { id: { [Op.in]: productIds } },
                include: [
                    { model: ProductVariant, as: 'variants' }
                ]
            });

            if (products.length === 0) return res.status(404).json({ message: "product_not_found" });

            res.json(products);
        } catch (err) {
            console.error('Error fetching products by IDs:', err);
            res.status(500).json({ message: "server_error_fetching_products_by_ids" });
        }
    },

    // GET: Get products by Seller ID
    getProductBySellerID: async (req, res) => {
        const { sellerId } = req.params;
        const sId = parseInt(sellerId, 10);
        if (isNaN(sId) || sId <= 0) {
            return res.status(400).json({ error: 'invalid_seller_id' });
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const search = req.query.search?.trim() || "";
        const offset = (page - 1) * limit;
        try {
            const where = { sellerId: sId };
            if (search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { productNumber: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                offset,
                limit,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: ProductVariant,
                        as: 'variants'
                    }
                ],
                distinct: true
            });

            res.json({
                products: rows,
                totalCount: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit),
            });
        } catch (error) {
            console.error("Error fetching seller products:", error);
            res.status(500).json({ message: "error_fetching_products" });
        }
    },

    // POST: Create a new product
    createProduct: async (req, res) => {
        console.log("Add new product formData", req.body);
        const validation = validateProductData(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.message });
        }
        const { sellerId, name, description, price, delprice, category, subcategory, images, variants } = req.body;
        console.log("Add new product formData", req.body);
        const t = await sequelize.transaction();
        try {
            const product = await Product.create({
                sellerId: parseInt(sellerId, 10),
                name,
                description,
                price,
                delprice,
                category,
                subcategory,
                images: images || [],
            }, { transaction: t });
            const variantsToCreate = variants.map(v => ({
                productId: product.id,
                size: v.size,
                color: v.color,
                stock: v.stock || 0
            }));
            await ProductVariant.bulkCreate(variantsToCreate, { transaction: t });
            await UserStats.increment('productCount', { by: 1, where: { userId: sellerId }, transaction: t });
            await t.commit();
            const fullProduct = await Product.findByPk(product.id, { include: [{ model: ProductVariant, as: 'variants' }] });
            res.status(201).json({ success: true, data: fullProduct });
        } catch (error) {
            if (t) await t.rollback();
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'error_adding_product' });
        }
    },

    // POST: Add a new Review
    // POST: Add a new Review (in productController)
    addReview: async (req, res) => {
        const productId = req.params.id;
        const { userId, rating, comment } = req.body;
        const t = await sequelize.transaction();

        try {
            // 1. Produkt & Verkäufer finden
            const product = await Product.findByPk(productId, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: "product_not_found" });
            }

            // 2. Doppelte Bewertung verhindern
            const existingReview = await ProductReview.findOne({
                where: { productId, userId },
                transaction: t
            });

            if (existingReview) {
                await t.rollback();
                return res.status(400).json({ message: "review_already_exists_error" });
            }

            // 3. Neue Produktbewertung erstellen
            const review = await ProductReview.create({
                productId,
                userId,
                rating,
                comment
            }, { transaction: t });

            // 4. Produkt-Stats aktualisieren (Denormalisierung für schnelle Sortierung)
            const productStats = await ProductReview.findAll({
                where: { productId },
                attributes: [
                    [fn('AVG', col('rating')), 'average'],
                    [fn('COUNT', col('id')), 'count']
                ],
                raw: true,
                transaction: t
            });

            const newAvg = parseFloat(productStats[0].average) || 0;
            const newCount = parseInt(productStats[0].count) || 0;

            await product.update({
                avgRating: parseFloat(newAvg.toFixed(1)),
                reviewCount: newCount
            }, { transaction: t });

            // 5. Verkäufer-Stats (UserStats) aktualisieren
            // Ein Produkt-Review verbessert oft auch das Ansehen des Verkäufers
            const sellerStats = await UserStats.findOne({
                where: { userId: product.sellerId },
                transaction: t
            });

            if (sellerStats) {
                const currentTotalRating = (sellerStats.avgRating * sellerStats.reviewCount) + rating;
                const newSellerReviewCount = sellerStats.reviewCount + 1;
                const newSellerAvg = currentTotalRating / newSellerReviewCount;

                await sellerStats.update({
                    reviewCount: newSellerReviewCount,
                    avgRating: parseFloat(newSellerAvg.toFixed(2))
                }, { transaction: t });
            }

            await t.commit();
            res.json({
                message: "success_add_review",
                review,
                newProductStats: { avgRating: newAvg.toFixed(1), reviewCount: newCount }
            });

        } catch (err) {
            if (t) await t.rollback();
            console.error("Error in addReview:", err);
            res.status(500).json({ message: "failed_to_add_review_error" });
        }
    }
};

module.exports = productController;


// muss CREATE EXTENSION IF NOT EXISTS pg_trgm;