/**
 * @jest-environment node
 */
const request = require('supertest');
const { app } = require('../../server_sql.js');
const { User, Product, Order, sequelize } = require('../../models');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

describe('AdminController Tests', () => {
    let adminToken;
    let adminUser;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@test.com',
            password: 'hashedpassword',
            role: 'admin',
            active: 'active',
            phone: '123456789',
            city: 1,
            subCity: 1
        });
        adminToken = jwt.sign({ id: adminUser.id, role: 'admin' }, JWT_SECRET);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/admin/stats', () => {
        it('should return dashboard stats', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ id: adminUser.id });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('totalUsers');
            expect(res.body).toHaveProperty('totalSellers');
        });

        it('should fail if not admin', async () => {
            const userToken = jwt.sign({ id: 99, role: 'user' }, JWT_SECRET);
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should return all users', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ id: adminUser.id });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/admin/sellers', () => {
        it('should return all sellers', async () => {
            const res = await request(app)
                .get('/api/admin/sellers')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ id: adminUser.id });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('PATCH /api/admin/toggle-user/:id', () => {
        it('should toggle user status', async () => {
            const user = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: 'toggle@test.com',
                password: 'password',
                role: 'user',
                active: 'active',
                phone: '987654321',
                city: 1,
                subCity: 1
            });

            const res = await request(app)
                .patch(`/api/admin/toggle-user/${user.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'inactive' });

            expect(res.statusCode).toBe(200);
            expect(res.body.active).toBe('inactive');
        });

        it('should return 500 for non-existent user', async () => {
            const res = await request(app)
                .patch('/api/admin/toggle-user/9999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'inactive' });
            expect(res.statusCode).toBe(500);
        });
    });
});
