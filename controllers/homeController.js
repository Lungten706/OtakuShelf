const pool = require('../config/db');

// 1. Home page: Show all manga
exports.getHomePage = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM manga ORDER BY created_at DESC');
    res.render('landing', { mangas: result.rows });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getMangaDetails = async (req, res) => {
  const { titleSlug } = req.params;

  try {
    // Convert slug to title (e.g., "one-piece" => "one piece")
    const title = titleSlug.replace(/-/g, ' ');

    // Fetch manga by title
    const mangaResult = await pool.query(
      'SELECT * FROM manga WHERE LOWER(title) = LOWER($1)',
      [title]
    );

    if (mangaResult.rows.length === 0) {
      return res.status(404).render('404');
    }

    const manga = mangaResult.rows[0];

    // Fetch chapters for that manga
    const chaptersResult = await pool.query(
      'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
      [manga.id]
    );

    const chapters = chaptersResult.rows;

    res.render('mangaDetails', { manga, chapters });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};