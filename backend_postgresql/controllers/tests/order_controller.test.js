/**
 * @jest-environment node
 */
const request = require('supertest');
const { app } = require('../../server_sql.js');
const { User, Product, Order, OrderItem, ProductVariant, sequelize } = require('../../models');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

describe('OrderController Tests', () => {
    let user, seller, product, variant, token, userToken;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        user = await User.create({
            firstName: 'Buyer', lastName: 'Order', email: 'buyer@test.com',
            password: 'password', role: 'user', active: 'active',
            phone: '333333333', city: 1, subCity: 1
        });
        seller = await User.create({
            firstName: 'Seller', lastName: 'Order', email: 'sellerorder@test.com',
            password: 'password', role: 'seller', active: 'active', shopName: 'OrderShop',
            phone: '444444444', city: 1, subCity: 1
        });
        token = jwt.sign({ id: seller.id, role: 'seller' }, JWT_SECRET);
        userToken = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET);

        product = await Product.create({
            sellerId: seller.id, name: 'Order Product', price: 20.0,
            description: 'Desc', category: 1, subcategory: 1,
            productNumber: 'ORD-1', images: []
        });

        variant = await ProductVariant.create({
            productId: product.id, color: 'Red', size: 'M', stock: 10, price: 20.0
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/orders/create', () => {
        it('should create an order successfully', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    userId: user.id,
                    sellerId: seller.id,
                    items: [{ productId: product.id, variantId: variant.id, quantity: 2, price: 20.0 }],
                    totalAmount: 40.0,
                    shippingAddress: { address: 'Buyer Address', phone: '123' }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');

            const updatedVariant = await ProductVariant.findByPk(variant.id);
            expect(updatedVariant.stock).toBe(8);
        });

        it('should fail if out of stock', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    userId: user.id,
                    sellerId: seller.id,
                    items: [{ productId: product.id, variantId: variant.id, quantity: 100, price: 20.0 }],
                    totalAmount: 2000.0,
                    shippingAddress: { address: 'Address', phone: '123' }
                });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        it('should update order status', async () => {
            const order = await Order.create({
                userId: user.id, sellerId: seller.id, totalAmount: 40.0,
                status: 'PENDING', orderNumber: 'ORDER-99', shippingAddress: {}
            });

            const res = await request(app)
                .put(`/api/orders/${order.id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'SHIPPED', note: 'Item shipped' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('SHIPPED');
        });
    });

    describe('GET /api/orders/seller/:sellerId', () => {
        it('should return seller orders', async () => {
            const res = await request(app)
                .get(`/api/orders/seller/${seller.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});
