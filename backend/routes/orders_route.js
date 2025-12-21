const express = require('express');
const router = express.Router(); // Create a new router object to define route handlers
const orderController = require('../controllers/order_controller');
 

// GET: Get the order by ID when '/api/orders/:id' called with orderController.getProductByID
router.get('/:id', orderController.getOrderByID);

// GET: Get the product by SellerID when '/seller/:sellerId' called with orderController.getOrderBySellerID
router.get('/seller/:sellerId', orderController.getOrderBySellerID);

// GET: Get the order by UserID when '/api/orders/:id' called with orderController.getProductByID
router.get('/user/:id', orderController.getOrderByUserID);

// GET: add new Order when '/api/orders/create' called with orderController.createOrder
router.post('/create', orderController.createOrder);  

// Update order Status
router.put("/:id/status", orderController.updateOrderStatus);

// GET: Anzahl der Bestellungen pro Produkt
router.get("/product/:productId/count", orderController.getOrderCountByProduct);

router.get("/stats/:sellerId", orderController.getSellerOrderStats);


module.exports = router;
