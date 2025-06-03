const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const upload = require('../config/multerConfig'); // Your custom multer config (handles 'pdf' field)



// Public Routes
router.get('/manga/:mangaId/chapters', chapterController.getMangaChapters); // List of chapters

// Admin Routes
router.get('/admin/chapters', chapterController.getChapters); // List all or filter by manga_id
router.post('/admin/chapters', chapterController.addChapter); // Add chapter (form)
router.get('/admin/chapters/edit/:id', chapterController.editChapterForm); // Chapter edit form
router.post('/admin/chapters/delete/:id', chapterController.deleteChapter); // Delete chapter
router.post('/admin/chapters/upload', upload.single('pdf'), chapterController.uploadChapter); // Upload full chapter (PDF)


module.exports = router;
