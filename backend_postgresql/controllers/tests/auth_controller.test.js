/**
 * @jest-environment node
 */
const request = require('supertest');
const { app } = require('../../server_sql.js');
const { User, sequelize, UserAuth } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock email service
jest.mock('../../utils/emailService', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

describe('AuthController Tests', () => {

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    let testUser;
    const password = 'password123';

    beforeEach(async () => {
        await User.destroy({ where: {}, truncate: true, cascade: true });
        const hashedPassword = await bcrypt.hash(password, 10);
        testUser = await User.create({
            firstName: 'Auth',
            lastName: 'Test',
            email: 'auth@test.com',
            password: hashedPassword,
            role: 'user',
            active: 'active',
            phone: '123456780',
            city: 1,
            subCity: 1
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'auth@test.com', password });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('auth@test.com');
        });

        it('should return 500 for wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'auth@test.com', password: 'wrong' });
            expect(res.statusCode).toBe(500);
        });

        it('should return 500 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'none@test.com', password });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('POST /api/auth/request-password-reset', () => {
        it('should initiate reset flow for valid email', async () => {
            const res = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: 'auth@test.com' });
            expect(res.statusCode).toBe(200);
        });

        it('should fail for invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: 'invalid@test.com' });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('POST /api/auth/last-online', () => {
        it('should update last online timestamp', async () => {
            const token = jwt.sign({ id: testUser.id, role: 'user' }, JWT_SECRET);
            const res = await request(app)
                .post('/api/auth/last-online')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: testUser.id });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('last_online_updated');
        });
    });
});
