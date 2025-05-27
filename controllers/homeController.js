// controllers/homeController.js
const pool = require('../config/db');

exports.getHomePage = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM manga ORDER BY created_at DESC');
    res.render('index', { mangas: result.rows });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// New function to get chapters for a specific manga
exports.getMangaChapters = async (req, res) => {
  const mangaId = req.params.id;

  try {
    const mangaQuery = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
    const chapterQuery = await pool.query('SELECT * FROM chapters WHERE manga_id = $1 ORDER BY created_at ASC', [mangaId]);

    const manga = mangaQuery.rows[0];
    const chapters = chapterQuery.rows;

    if (!manga) {
      return res.status(404).send('Manga not found');
    }

    res.render('readManga', { manga, chapters });
  } catch (error) {
    console.error('Error loading manga chapters:', error);
    res.status(500).send('Internal Server Error');
  }
};
