const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

router.get('/genres', genreController.getAllGenres); // or whatever your handler is

module.exports = router;
