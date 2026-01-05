const express = require('express');
const router = express.Router(); // Create a new router object to define route handlers
const productController = require('../controllers/product_controller');

const { verifyToken, verifySeller } = require('../middleware/auth');

// GET: Get top products when '/api/products/top' called with productController.getTopProducts
router.get('/top', productController.getTopProducts);

// GET: Get the 12 last products when '/api/products/latest' called with productController.getNewProducts

router.get('/latest', productController.getNewProducts);

// GET: Get products by IDs when '/api/products/saved_ids' called with productController.getProductsByIDs
router.get('/saved_ids', productController.getProductsByIDs);

// GET: Get the product by ID when '/api/products/:id' called with productController.getProductByID
router.get('/:id', productController.getProductByID);

// GET: Get the product by SellerID when '/api/products/:id' called with productController.getProductByID
router.get('/seller/:sellerId', productController.getProductBySellerID);

// POST: add new Product - Only for sellers/admins
router.post('/create', verifyToken, verifySeller, productController.createProduct);

// POST: ADD REVIEW - Only for logged in users
router.post("/:id/rate", verifyToken, productController.addReview);

module.exports = router; 
