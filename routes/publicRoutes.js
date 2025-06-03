const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const readController = require('../controllers/readController');

// Home page
router.get('/home', homeController.getHomePage);

// Manga details
router.get('/manga/:title', homeController.getMangaByTitle);

// Chapter reader
router.get('/OtakuShelf/:title/:chapterNumber', readController.readChapter);

module.exports = router;
