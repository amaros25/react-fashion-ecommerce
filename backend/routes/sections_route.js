const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sections_controller');

const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get('/', sectionController.getSections);
router.post('/create', verifyToken, verifyAdmin, sectionController.createSection);

module.exports = router;