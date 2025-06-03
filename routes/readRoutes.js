const express = require('express');
const router = express.Router();
const readController = require('../controllers/readController');

router.get('/OtakuShelf/:mangaSlug/:chapterNumber', readController.readChapter);
router.get('/OtakuShelf/:mangaSlug', readController.showMangaDetails);


module.exports = router;
