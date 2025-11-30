const express = require('express');
const router = express.Router(); // Create a new router object to define route handlers
const productController = require('../controllers/product_controller');

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

// GET: add new Product when '/api/products/' called with productController.createProduct
router.post('/create', productController.createProduct);

//ADD REVIEW
router.post("/:id/rate", productController.addReview);

module.exports = router; 
