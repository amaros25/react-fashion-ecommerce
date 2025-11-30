const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/create", userController.createUser); // Registrierung
router.patch("/:id/updateContact", userController.updateUser);

module.exports = router;
