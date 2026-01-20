/**
 * @jest-environment node
 */
const request = require('supertest');
const { app } = require('../../server_sql.js');
const { User, Product, sequelize } = require('../../models');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './backend_postgresql/.env' });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
const JWT_SECRET = process.env.JWT_SECRET;

describe('UserController Tests', () => {

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    let testUser;
    let token;

    beforeEach(async () => {
        await User.destroy({ where: {}, truncate: true, cascade: true });

        testUser = await User.create({
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'test@test.com',
            password: 'hashedpassword',
            role: 'seller',
            active: 'active',
            phone: '123456',
            address: 'Teststraße 1',
            city: 1,
            subCity: 1,
            shopName: 'TestShop'
        });

        token = jwt.sign(
            { id: testUser.id, userId: testUser.id, role: testUser.role },
            JWT_SECRET
        );
    });

    describe('GET /api/users/getSellersByIds', () => {
        it('should return sellers by IDs', async () => {
            const res = await request(app)
                .get(`/api/users/getSellersByIds?ids=${testUser.id}`)
                .set('Authorization', `Bearer ${token}`);

            if (res.statusCode !== 200) console.log('DEBUG getSellersByIds ERROR:', res.body);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toBe(testUser.id);
        });

        it('should return 400 if no IDs provided', async () => {
            const res = await request(app)
                .get('/api/users/getSellersByIds?ids=')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/users/public-seller/:id', () => {
        it('should return public seller data', async () => {
            const res = await request(app)
                .get(`/api/users/public-seller/${testUser.id}`)
                .set('Authorization', `Bearer ${token}`);

            if (res.statusCode !== 200) console.log('DEBUG public-seller ERROR:', res.statusCode, res.body);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('shopName', 'TestShop');
        });

        it('should return 404 for non-existent seller', async () => {
            const res = await request(app)
                .get('/api/users/public-seller/9999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('GET /api/users/:id/user', () => {
        it('should find user by ID', async () => {
            const res = await request(app)
                .get(`/api/users/${testUser.id}/user`)
                .set('Authorization', `Bearer ${token}`);

            if (res.statusCode !== 200) console.log('DEBUG getUserById ERROR:', res.statusCode, res.body);
            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toBe(testUser.email);
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/users/9999/user')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/users/create', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                firstName: 'Erika',
                lastName: 'Musterfrau',
                email: 'erika@muster.com',
                password: 'password123',
                phone: '987654',
                address: 'Frauenweg 2',
                role: 'user'
            };

            const res = await request(app)
                .post('/api/users/create')
                .send(newUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
        });

        it('should fail if email already exists', async () => {
            const duplicateUser = {
                firstName: 'Max',
                lastName: 'Mustermann',
                email: 'test@test.com',
                password: 'password123',
                role: 'user'
            };

            const res = await request(app)
                .post('/api/users/create')
                .send(duplicateUser);

            expect(res.statusCode).toBe(500); // Or 400 depending on implementation
        });
    });

    describe('PUT /api/users/:id/updateImage', () => {
        it('should update profile image', async () => {
            const res = await request(app)
                .put(`/api/users/${testUser.id}/updateImage`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    imageUrl: 'http://new-image.jpg'
                });

            if (res.statusCode !== 200) console.log('DEBUG updateImage ERROR:', res.statusCode, res.body);
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('PATCH /api/users/:id/address', () => {
        it('should update user address', async () => {
            const res = await request(app)
                .patch(`/api/users/${testUser.id}/address`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    address: {
                        address: 'New Address 123',
                        city: 2,
                        subCity: 2
                    }
                });

            if (res.statusCode !== 200) console.log('DEBUG address ERROR:', res.statusCode, res.body);
            expect(res.statusCode).toEqual(200);
            const user = await User.findByPk(testUser.id);
            expect(user.address).toBe('New Address 123');
        });
    });

    describe('PATCH /api/users/:id/phone', () => {
        it('should update user phone', async () => {
            const res = await request(app)
                .patch(`/api/users/${testUser.id}/phone`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    phone: '000000000'
                });

            if (res.statusCode !== 200) console.log('DEBUG phone ERROR:', res.statusCode, res.body);
            expect(res.statusCode).toEqual(200);
            const user = await User.findByPk(testUser.id);
            expect(user.phone).toBe('000000000');
        });
    });

    describe('GET /api/sellers/:sellerId/bills', () => {
        it('should return seller bills', async () => {
            const res = await request(app)
                .get(`/api/sellers/${testUser.id}/bills`)
                .set('Authorization', `Bearer ${token}`)
                .send({ id: testUser.id });

            if (res.statusCode !== 200) console.log('DEBUG bills ERROR:', res.statusCode, res.body);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.bills)).toBe(true);
        });
    });
});
