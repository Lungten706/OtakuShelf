const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const upload = require('../config/multerConfig');

// Add this new route
router.get('/manga/:mangaId/chapters', chapterController.getMangaChapters);

// Existing routes
router.post('/upload-chapter', upload.single('content_url'), chapterController.uploadChapter);
router.get('/chapters/edit/:id', chapterController.editChapterForm);
router.get('/chapters', chapterController.getChapters);
router.post('/chapters', chapterController.addChapter);
router.delete('/chapters/:id', chapterController.deleteChapter);
router.get('/manga/:mangaId/chapters/:chapterId', chapterController.viewChapter);
router.get('/manga/:mangaId/chapter/:chapterNumber', chapterController.viewChapter);
module.exports = router;