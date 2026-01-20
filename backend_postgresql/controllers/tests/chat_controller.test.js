/**
 * @jest-environment node
 */
const request = require('supertest');
const { app } = require('../../server_sql.js');
const { User, Chat, ChatMessage, sequelize } = require('../../models');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './backend_postgresql/.env' });
const JWT_SECRET = process.env.JWT_SECRET;

describe('ChatController Tests', () => {
    let user, seller, token, userToken;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        user = await User.create({
            firstName: 'User', lastName: 'Chat', email: 'userchat@test.com',
            password: 'password', role: 'user', active: 'active',
            phone: '111111111', city: 1, subCity: 1
        });
        seller = await User.create({
            firstName: 'Seller', lastName: 'Chat', email: 'sellerchat@test.com',
            password: 'password', role: 'seller', active: 'active', shopName: 'ChatShop',
            phone: '222222222', city: 1, subCity: 1
        });
        token = jwt.sign({ id: seller.id, role: 'seller' }, JWT_SECRET);
        userToken = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/chats/create', () => {
        it('should create a new chat session', async () => {
            const res = await request(app)
                .post('/api/chats/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ userId: user.id, sellerId: seller.id });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
        });

        it('should return error for missing IDs', async () => {
            const res = await request(app)
                .post('/api/chats/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ userId: user.id });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('GET /api/chats/user/:userId', () => {
        it('should return all chats for a user', async () => {
            const res = await request(app)
                .get(`/api/chats/user/${user.id}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/chats/:chatId/message', () => {
        it('should add a message to a chat', async () => {
            const chat = await Chat.create({ userId: user.id, sellerId: seller.id });
            const res = await request(app)
                .post(`/api/chats/${chat.id}/message`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ senderId: user.id, text: 'Hello' });

            expect(res.statusCode).toBe(201);
            expect(res.body.text).toBe('Hello');
        });
    });

    describe('GET /api/chats/unread/:userId', () => {
        it('should return unread count', async () => {
            const res = await request(app)
                .get(`/api/chats/unread/${seller.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('unreadCount');
        });
    });
});
