const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");

const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, userController.getAllUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.post("/create", userController.createUser); // Registration remains public
router.patch("/:id/updateContact", verifyToken, userController.updateUser);
router.put("/:id/updateImage", userController.updateUserImage);

module.exports = router;
