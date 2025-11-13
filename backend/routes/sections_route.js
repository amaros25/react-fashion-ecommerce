const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sections_controller');
 
router.get('/', sectionController.getSections);
router.post('/create', sectionController.createSection); 

module.exports = router;