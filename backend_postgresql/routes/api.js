const express = require('express');
const router = express.Router();
const productController = require('../controllers/product_controller');
const authController = require('../controllers/auth_controller');
const orderController = require('../controllers/order_controller');
const chatController = require('../controllers/chat_controller');
const userController = require('../controllers/user_controller');
const adminController = require('../controllers/admin_controller');
const reviewController = require('../controllers/review_controller');


// Re-using original middleware (DB agnostic)
const { verifyToken, verifySeller, verifyAdmin } = require('../middleware/auth');

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/request-password-reset', authController.requestPasswordReset);
router.post('/auth/reset-password/:token', authController.resetPassword);
router.post('/auth/last-online', authController.updateLastOnline);


// Product Routes
router.get('/products/latest', productController.getNewProducts);
router.get('/products/saved_ids', productController.getProductsByIDs);
router.get('/products/:id', productController.getProductByID);
router.get('/products/seller/:sellerId', verifyToken, verifySeller, productController.getProductBySellerID);
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
router.get('/chats/:chatId', verifyToken, chatController.getChatById);
router.post('/chats/:chatId/message', verifyToken, chatController.addMessage);
router.post('/chats/create', verifyToken, chatController.createChat);
router.patch('/chats/:chatId/messages/read', verifyToken, chatController.updateReadStatus);
router.get('/chats/unread/:userId', verifyToken, chatController.getUnreadCount);

// User Routes

router.get('/users/:id/user', userController.getUserById);
router.get('/users/getSellerByIds', userController.getSellersByIds);
router.post('/users/create', userController.createUser); // Public
router.put('/users/:id/updateImage', verifyToken, userController.updateUserImage);
router.patch('/users/:id/address', verifyToken, userController.updateUserAddress);
router.patch('/users/:id/phone', verifyToken, userController.updateUserPhone);
router.get('/sellers/:sellerId/bills', verifyToken, userController.getSellerBills);
router.get('/users/public-seller/:id', userController.getPublicSeller);


// Admin Routes (Matching original admin_route.js)
router.get('/admin/stats', verifyToken, verifyAdmin, adminController.getDashboardStats);
router.get('/admin/users', verifyToken, verifyAdmin, adminController.getAllUsers);
router.get('/admin/sellers', verifyToken, verifyAdmin, adminController.getAllSellers);
router.get('/admin/products', verifyToken, verifyAdmin, adminController.getAllProducts);
router.get('/admin/orders', verifyToken, verifyAdmin, adminController.getAllOrders);
router.patch('/admin/toggle-user/:id', verifyToken, verifyAdmin, adminController.toggleUser);
router.patch('/admin/toggle-seller/:id', verifyToken, verifyAdmin, adminController.toggleSeller);


// Rating Routes
router.post('/api/reviews/seller', reviewController.rateSeller);
router.post('/api/reviews/product', reviewController.rateProduct);

module.exports = router;
