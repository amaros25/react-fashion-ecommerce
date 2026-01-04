const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/create", userController.createUser);
router.patch("/:id/updateContact", userController.updateUser);
router.put("/:id/updateImage", userController.updateUserImage);

module.exports = router;
