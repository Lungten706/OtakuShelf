const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const upload = require('../middleware/mangaUpload');

// Handle favicon requests
router.get('/favicon.ico', mangaController.handleFavicon);

// GET /manga -> render manga admin page with list + modal
router.get('/manga', mangaController.renderMangaAdminPage);

// POST /manga -> handle manga upload via form
router.post('/manga', upload.single('cover'), mangaController.addManga);

// GET /manga/:id -> Show individual manga details
router.get('/manga/:id', mangaController.getMangaById); // Fixed the route path spacing

// DELETE route using POST
router.post('/manga/delete/:id', mangaController.deleteManga);

module.exports = router;
