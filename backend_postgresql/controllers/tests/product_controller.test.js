const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, sequelize } = require('../../server_sql');
const { Product, User, UserStats } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dein_geheimnis';

describe('ProductController Advanced Tests', () => {
    let token;
    let sellerId = 1;

    beforeAll(async () => {
        await sequelize.sync({ force: false });
        token = jwt.sign({ id: sellerId, role: 'seller' }, JWT_SECRET, { expiresIn: '1h' });

        // Sicherstellen, dass ein UserStats Eintrag für den Seller existiert (wichtig für createProduct)
        await UserStats.findOrCreate({ where: { userId: sellerId }, defaults: { productCount: 0, reviewCount: 0, avgRating: 0 } });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Validation Logic (POST /api/products/create)', () => {

        it('should fail with missing_required_fields', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: "Unvollständig" }); // Viele Felder fehlen

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("missing_required_fields");
        });

        it('should fail with duplicate_variant_size_color_combination', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sellerId: sellerId,
                    name: "Duplicate Test",
                    description: "Test",
                    price: 10,
                    delprice: 5,
                    category: 1,
                    subcategory: 1,
                    images: ["img.jpg"],
                    variants: [
                        { size: "M", color: "Red", stock: 10 },
                        { size: "M", color: "Red", stock: 5 } // Doppelt!
                    ]
                });

            expect(res.body.message).toBe("duplicate_variant_size_color_combination");
        });

        it('should fail with invalid_price', async () => {
            const res = await request(app)
                .post('/api/products/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sellerId: sellerId, name: "Price Test", description: "Test",
                    price: -10, // Ungültig
                    delprice: 5, category: 1, subcategory: 1, images: ["img.jpg"],
                    variants: [{ size: "M", color: "Blue", stock: 10 }]
                });
            expect(res.body.message).toBe("invalid_price");
        });
    });

    describe('Search & Filter (GET /api/products/latest)', () => {
        it('should filter by category', async () => {
            const res = await request(app).get('/api/products/latest?category=1');
            expect(res.statusCode).toBe(200);
            if (res.body.products.length > 0) {
                expect(res.body.products[0].category).toBe(1);
            }
        });

        it('should handle search queries', async () => {
            const res = await request(app).get('/api/products/latest?search=Test');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    describe('Review Logic (POST /api/products/:id/review)', () => {
        let testProductId;

        beforeAll(async () => {
            // Erstelle ein Produkt für die Review-Tests
            const p = await Product.create({
                sellerId, name: "Review Produkt", description: "Test",
                price: 10, delprice: 5, category: 1, subcategory: 1, images: ["test.jpg"]
            });
            testProductId = p.id;
        });

        it('should add a review and update product stats', async () => {
            const res = await request(app)
                .post(`/api/products/${testProductId}/review`)
                .send({
                    userId: 2, // Ein anderer User bewertet
                    rating: 5,
                    comment: "Super Qualität!"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success_add_review");
            expect(res.body.newProductStats.avgRating).toBe("5.0");
        });

        it('should prevent duplicate reviews from same user', async () => {
            const res = await request(app)
                .post(`/api/products/${testProductId}/review`)
                .send({
                    userId: 2,
                    rating: 1,
                    comment: "Zweite Bewertung Versuch"
                });

            expect(res.body.message).toBe("review_already_exists_error");
        });
    });
});