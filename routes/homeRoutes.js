const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page
router.get('/', homeController.getHomePage);

// Manga Details Page
router.get('/home/:titleSlug', homeController.getMangaDetails);


// Read Chapter Page

module.exports = router;
