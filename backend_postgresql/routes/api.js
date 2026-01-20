const express = require('express');
const { generalLimiter, maxiGeneralLimiter, authLimiter, floodLimiter } = require('./rateLimiter');

const router = express.Router();
const productController = require('../controllers/product_controller');
const authController = require('../controllers/auth_controller');
const orderController = require('../controllers/order_controller');
const chatController = require('../controllers/chat_controller');
const userController = require('../controllers/user_controller');
const adminController = require('../controllers/admin_controller');
const reviewController = require('../controllers/review_controller');

// Re-using original middleware (DB agnostic)
const { verifyToken, verifySellerSecure, verifyAdmin, verifyUserSecure, verifyGlobalUserActions } = require('../middleware/auth');

// Auth Routes
router.post('/auth/login', floodLimiter, authLimiter, authController.login);
router.post('/auth/request-password-reset', floodLimiter, authLimiter, authController.requestPasswordReset);
router.post('/auth/reset-password/:token', floodLimiter, authLimiter, authController.resetPassword);
router.post('/auth/last-online', floodLimiter, verifyToken, verifyGlobalUserActions, authController.updateLastOnline);

// Product Routes
router.get('/products/latest', floodLimiter, generalLimiter, productController.getNewProducts);
router.get('/products/saved_ids', floodLimiter, generalLimiter, productController.getProductsByIDs);


router.get('/products/:id/remaining', floodLimiter, generalLimiter, productController.getRemainingProductDetails)
router.get('/products/:id/complete', floodLimiter, generalLimiter, productController.getProductDetailsComplete)

router.get('/products/seller/:sellerId', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, productController.getProductBySellerID);
router.post('/products/create', floodLimiter, generalLimiter, verifyToken, verifySellerSecure, productController.createProduct);

// Order Routes
router.get('/orders/:id', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.getOrderByID);
router.get('/orders/seller/:sellerId', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.getOrderBySellerID);
router.get('/orders/number/:orderNumber', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.getOrderByNumber);
router.get('/orders/user/:id', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.getOrderByUserID);
router.post('/orders/create', floodLimiter, maxiGeneralLimiter, verifyToken, verifyGlobalUserActions, orderController.createOrder);
router.put('/orders/:id/status', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.updateOrderStatus);
router.get('/orders/product/:productId/count', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.getOrderCountByProduct);
router.get('/orders/stats/:sellerId', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, orderController.getSellerOrderStats);

// Chat Routes
router.get('/chats/user/:userId', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, chatController.getUserChats);
router.get('/chats/:chatId', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, chatController.getChatById);
router.post('/chats/:chatId/message', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, chatController.addMessage);
router.post('/chats/create', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, chatController.createChat);
router.patch('/chats/:chatId/messages/read', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, chatController.updateReadStatus);
router.get('/chats/unread/:userId', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, chatController.getUnreadCount);

// User Routes
router.post('/users/create', floodLimiter, authLimiter, userController.createUser); // Public

// User Only Actions
router.get('/users/:id/user', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, userController.getUserById);
router.post('/products/:id/rate', floodLimiter, generalLimiter, verifyToken, verifyUserSecure, productController.addReview);

//only Seller Actions
router.get('/sellers/:sellerId/bills', floodLimiter, generalLimiter, verifyToken, verifySellerSecure, userController.getSellerBills);
router.get('/users/public-seller/:id', floodLimiter, generalLimiter, verifyToken, verifySellerSecure, userController.getPublicSeller);

// User && Seller Actions
router.put('/users/:id/updateImage', floodLimiter, maxiGeneralLimiter, verifyToken, verifyGlobalUserActions, userController.updateUserImage);
router.patch('/users/:id/address', floodLimiter, maxiGeneralLimiter, verifyToken, verifyGlobalUserActions, userController.updateUserAddress);
router.patch('/users/:id/phone', floodLimiter, maxiGeneralLimiter, verifyToken, verifyGlobalUserActions, userController.updateUserPhone);
// Rating Routes
router.post('/api/reviews/seller', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, reviewController.rateSeller);
router.post('/api/reviews/product', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, reviewController.rateProduct);


// Admin Routes (Matching original admin_route.js)
router.get('/admin/stats', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.getDashboardStats);
router.get('/admin/users', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.getAllUsers);
router.get('/admin/sellers', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.getAllSellers);
router.get('/admin/products', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.getAllProducts);
router.get('/admin/orders', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.getAllOrders);
router.patch('/admin/toggle-user/:id', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.toggleUser);
router.patch('/admin/toggle-seller/:id', floodLimiter, generalLimiter, verifyToken, verifyAdmin, adminController.toggleSeller);


//Unknown Routes
router.get('/users/getSellerByIds', floodLimiter, generalLimiter, verifyToken, verifyGlobalUserActions, userController.getSellersByIds);
module.exports = router;
