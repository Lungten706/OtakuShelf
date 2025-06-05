const express = require('express');
const router = express.Router();

const mangaController = require('../controllers/mangaController');
const chapterController = require('../controllers/chapterController');
const { isAdmin, isLoggedIn } = require('../middleware/authMiddleware');

// Centralized Multer config
const upload = require('../config/uploadMiddleware'); // ✅ Supports both Cloudinary & local


// Handle favicon.ico requests
router.get('/favicon.ico', mangaController.handleFavicon);

/////////////////////////////////////////////////
// 📘 Manga Admin Routes
/////////////////////////////////////////////////

// GET admin manga page
router.get('/manga', isLoggedIn, isAdmin, mangaController.renderMangaAdminPage);

// POST add manga (cover image uploaded)
router.post('/manga', isLoggedIn, isAdmin, upload.single('cover_url'), mangaController.addManga);

// DELETE manga
router.get('/manga/delete/:id', isLoggedIn, isAdmin, mangaController.deleteManga);

/////////////////////////////////////////////////
// 📕 Chapter Admin Routes
/////////////////////////////////////////////////

// GET all chapters (optionally filtered by manga_id)
router.get('/chapters', isLoggedIn, isAdmin, chapterController.getChapters);

// GET edit chapter form
router.get('/chapters/edit/:id', isLoggedIn, isAdmin, chapterController.editChapterForm);

// POST add new chapter (metadata only)
router.post('/chapters', isLoggedIn, isAdmin, chapterController.addChapter);

// POST upload chapter file (PDF upload)
router.post('/chapters/upload', isLoggedIn, isAdmin, upload.single('pdf'), chapterController.uploadChapter);

// DELETE chapter
router.delete('/chapters/:id', isLoggedIn, isAdmin, chapterController.deleteChapter);

module.exports = router;
