const express = require('express');
const router = express.Router(); // Create a new router object to define route handlers
const sellerController = require('../controllers/seller_controller');

// GET: Get all sellers when 'api/sellers/' called with sellerController.getAllSellers
router.get('/', sellerController.getAllSellers);

// GET: Get a single seller by ID when '/api/sellers/:id' is called with sellerController.getSellerById
router.get('/:id', sellerController.getSellerById);

// POST: Add a new seller when '/api/sellers/create' is called with sellerController.createSeller
router.post('/create', sellerController.createSeller);

// Export the router so it can be used in the main app
module.exports = router;