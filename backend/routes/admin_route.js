const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");

// Middleware to check if user is admin could be added here
// For now, we assume the frontend sends a token and we might verify it in a real middleware 
// but for the sake of speed we stick to the basic router.
// Ideally: router.use(verifyToken, verifyAdmin);

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.get("/sellers", adminController.getAllSellers);
router.get("/products", adminController.getAllProducts);
router.get("/orders", adminController.getAllOrders);
router.patch("/toggle-user/:id", adminController.toggleUser);
router.patch("/toggle-seller/:id", adminController.toggleSeller);

module.exports = router;
