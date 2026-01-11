const express = require('express');
const router = express.Router();
const productController = require('../controllers/product_controller');
const authController = require('../controllers/auth_controller');
const orderController = require('../controllers/order_controller');
const chatController = require('../controllers/chat_controller');
const userController = require('../controllers/user_controller');
const sellerController = require('../controllers/seller_controller');
const adminController = require('../controllers/admin_controller');
const sectionsController = require('../controllers/sections_controller');

// Re-using original middleware (DB agnostic)
const { verifyToken, verifySeller, verifyAdmin } = require('../../middleware/auth');

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/request-password-reset', authController.requestPasswordReset);
router.post('/auth/reset-password/:token', authController.resetPassword);
router.post('/auth/last-online', authController.updateLastOnline);
router.post('/auth/register', authController.registerUser);

// Product Routes
router.get('/products/top', productController.getTopProducts);
router.get('/products/latest', productController.getNewProducts);
router.get('/products/saved_ids', productController.getProductsByIDs);
router.get('/products/:id', productController.getProductByID);
router.get('/products/seller/:sellerId', productController.getProductBySellerID);
router.post('/products/create', verifyToken, verifySeller, productController.createProduct);
router.post('/products/:id/rate', verifyToken, productController.addReview);

// Order Routes
router.get('/orders/:id', verifyToken, orderController.getOrderByID);
router.get('/orders/seller/:sellerId', verifyToken, orderController.getOrderBySellerID);
router.get('/orders/number/:orderNumber', verifyToken, orderController.getOrderByNumber);
router.get('/orders/user/:id', verifyToken, orderController.getOrderByUserID);
router.post('/orders/create', verifyToken, orderController.createOrder);
router.put('/orders/:id/status', verifyToken, orderController.updateOrderStatus);
router.get('/orders/product/:productId/count', verifyToken, orderController.getOrderCountByProduct);
router.get('/orders/stats/:sellerId', verifyToken, orderController.getSellerOrderStats);

// Chat Routes
router.get('/chats/user/:userId', verifyToken, chatController.getUserChats);
router.get('/chats/seller/:userId', verifyToken, chatController.getUserChats);
router.get('/chats/:chatId', verifyToken, chatController.getChatById);
router.post('/chats/:chatId/message', verifyToken, chatController.addMessage);
router.post('/chats/create', verifyToken, chatController.createChat);
router.patch('/chats/:chatId/messages/read', verifyToken, chatController.updateReadStatus);
router.get('/chats/unread/seller/:sellerId', verifyToken, chatController.getUnreadCount);
router.get('/chats/unread/user/:userId', verifyToken, chatController.getUnreadUserCount);

// User Routes
router.get('/users', verifyToken, userController.getAllUsers);
router.get('/users/:id', verifyToken, userController.getUserById);
router.post('/users/create', userController.createUser); // Public
router.patch('/users/:id/updateContact', verifyToken, userController.updateUser);
router.put('/users/:id/updateImage', verifyToken, userController.updateUserImage);

// Seller Routes
router.get('/sellers/getByIds', sellerController.getSellerByIds);
router.get('/sellers/:id', sellerController.getSellerById);
router.post('/sellers/create', sellerController.createSeller); // Public
router.put('/sellers/:id', verifyToken, sellerController.updateSeller);
router.post('/sellers/:id/rate', verifyToken, sellerController.rateSeller);
router.put('/sellers/:id/updateImage', verifyToken, sellerController.updateSellerImage);
router.get('/sellers/:sellerId/bills', verifyToken, sellerController.getSellerBills);

// Admin Routes (Matching original admin_route.js)
router.get('/admin/stats', verifyToken, verifyAdmin, adminController.getDashboardStats);
router.get('/admin/users', verifyToken, verifyAdmin, adminController.getAllUsers);
router.get('/admin/sellers', verifyToken, verifyAdmin, adminController.getAllSellers);
router.get('/admin/products', verifyToken, verifyAdmin, adminController.getAllProducts);
router.get('/admin/orders', verifyToken, verifyAdmin, adminController.getAllOrders);
router.patch('/admin/toggle-user/:id', verifyToken, verifyAdmin, adminController.toggleUser);
router.patch('/admin/toggle-seller/:id', verifyToken, verifyAdmin, adminController.toggleSeller);

// Sections Routes
router.get('/sections', sectionsController.getSections);
router.post('/sections', verifyToken, verifyAdmin, sectionsController.createSection);

module.exports = router;
