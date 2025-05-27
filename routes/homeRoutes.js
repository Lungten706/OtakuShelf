// routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/home', homeController.getHomePage);

// Add this route to show chapters for a specific manga
router.get('/manga/:id', homeController.getMangaChapters);

module.exports = router;
