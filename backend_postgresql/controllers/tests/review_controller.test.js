/**
 * @jest-environment node
 */
const request = require('supertest');
const { app } = require('../../server_sql.js');
const { User, Product, Order, UserStats, UserReview, ProductReview, sequelize } = require('../../models');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

describe('ReviewController Tests', () => {
    let user, seller, product, order, token, userToken;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        user = await User.create({
            firstName: 'Reviewer', lastName: 'User', email: 'reviewer@test.com',
            password: 'password', role: 'user', active: 'active',
            phone: '666666666', city: 1, subCity: 1
        });
        seller = await User.create({
            firstName: 'Seller', lastName: 'Reviewed', email: 'sellerrev@test.com',
            password: 'password', role: 'seller', active: 'active', shopName: 'RevShop',
            phone: '777777777', city: 1, subCity: 1
        });
        await UserStats.create({ userId: seller.id, avgRating: 0, reviewCount: 0 });

        product = await Product.create({
            sellerId: seller.id, name: 'Rev Product', price: 10.0,
            description: 'Desc', category: 1, subcategory: 1,
            productNumber: 'REV-1', images: []
        });

        order = await Order.create({
            userId: user.id, sellerId: seller.id, totalAmount: 10.0,
            status: 'DELIVERED', orderNumber: 'ORD-REV', shippingAddress: {}
        });

        token = jwt.sign({ id: seller.id, role: 'seller' }, JWT_SECRET);
        userToken = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/reviews/seller', () => {
        it('should rate a seller successfully', async () => {
            const res = await request(app)
                .post('/api/reviews/seller')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    sellerId: seller.id,
                    orderId: order.id,
                    userId: user.id,
                    rating: 5,
                    comment: 'Great seller!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('seller_rating_success');

            const stats = await UserStats.findOne({ where: { userId: seller.id } });
            expect(stats.reviewCount).toBe(1);
            expect(parseFloat(stats.avgRating)).toBe(5);
        });

        it('should fail if missing data', async () => {
            const res = await request(app)
                .post('/api/api/reviews/seller')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ sellerId: seller.id });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('POST /api/reviews/product', () => {
        it('should rate a product successfully', async () => {
            const res = await request(app)
                .post('/api/reviews/product')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    productId: product.id,
                    userId: user.id,
                    rating: 4,
                    comment: 'Good product'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('product_rating_success');

            const p = await Product.findByPk(product.id);
            expect(p.reviewCount).toBe(1);
            expect(parseFloat(p.avgRating)).toBe(4);
        });
    });
});
