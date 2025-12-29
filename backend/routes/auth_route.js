const express = require("express");
const router = express.Router();
const { login, logout, requestPasswordReset, resetPassword } = require("../controllers/auth_controller");

router.post("/login", login);
router.post("/logout", logout);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

module.exports = router;