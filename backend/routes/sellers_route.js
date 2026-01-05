const express = require('express');
const router = express.Router(); // Create a new router object to define route handlers
const sellerController = require('../controllers/seller_controller');

const { verifyToken } = require("../middleware/auth");

// GET: Get Sellers By IDs
router.get('/getByIds', sellerController.getSellerByIds);

// GET: Get a single seller by ID
router.get('/:id', sellerController.getSellerById);

// POST: Add a new seller - Registration public
router.post('/create', sellerController.createSeller);

// PUT: Update seller (address/phone)
router.put('/:id', verifyToken, sellerController.updateSeller);

// POST: Rate seller
router.post('/:id/rate', verifyToken, sellerController.rateSeller);

router.put("/:id/updateImage", verifyToken, sellerController.updateSellerImage);

router.get("/:sellerId/bills", verifyToken, sellerController.getSellerBills);


// Export the router so it can be used in the main app
module.exports = router;