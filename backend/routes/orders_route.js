const express = require('express');
const router = express.Router(); // Create a new router object to define route handlers
const orderController = require('../controllers/order_controller');


const { verifyToken } = require('../middleware/auth');

// Apply verifyToken to all routes in this file
router.use(verifyToken);

// GET: Get the order by ID
router.get('/:id', orderController.getOrderByID);

// GET: Get the product by SellerID
router.get('/seller/:sellerId', orderController.getOrderBySellerID);

router.get('/number/:orderNumber', orderController.getOrderByNumber);

// GET: Get the order by UserID
router.get('/user/:id', orderController.getOrderByUserID);

// POST: add new Order
router.post('/create', orderController.createOrder);

// Update order Status
router.put("/:id/status", orderController.updateOrderStatus);

// GET: Anzahl der Bestellungen pro Produkt
router.get("/product/:productId/count", orderController.getOrderCountByProduct);

router.get("/stats/:sellerId", orderController.getSellerOrderStats);


module.exports = router;
