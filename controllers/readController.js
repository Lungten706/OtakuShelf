const pool = require('../config/db');

// Show manga details using slug (e.g., /OtakuShelf/one-piece)
exports.showMangaDetails = async (req, res) => {
  const { mangaSlug } = req.params;

  try {
    const mangaResult = await pool.query(
      `SELECT * FROM manga WHERE LOWER(REPLACE(title, ' ', '-')) = $1`,
      [mangaSlug.toLowerCase()]
    );

    if (mangaResult.rowCount === 0) return res.status(404).send('Manga not found');
    const manga = mangaResult.rows[0];

    const chapterResult = await pool.query(
      `SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC`,
      [manga.id]
    );

    res.render('mangaDetails', { manga, chapters: chapterResult.rows });
  } catch (err) {
    console.error('Error loading manga details:', err);
    res.status(500).send('Server Error');
  }
};

exports.readChapter = async (req, res) => {
  const { mangaSlug, chapterNumber } = req.params;

  try {
    // Find manga by slugified title
    const mangaQuery = `
      SELECT * FROM manga 
      WHERE LOWER(REPLACE(title, ' ', '-')) = $1
    `;
    const mangaResult = await pool.query(mangaQuery, [mangaSlug.toLowerCase()]);

    if (mangaResult.rows.length === 0) {
      console.log('Manga not found for slug:', mangaSlug);
      return res.status(404).send('Manga not found');
    }

    const manga = mangaResult.rows[0];

    // Fetch all chapters for this manga
    const chaptersResult = await pool.query(
      'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
      [manga.id]
    );

    const chapters = chaptersResult.rows;
    const currentChapter = chapters.find(ch => ch.chapter_number == chapterNumber);
    if (!currentChapter) {
      console.log(`Chapter ${chapterNumber} not found for manga ${manga.title}`);
      return res.status(404).send('Chapter not found');
    }

    const currentIndex = chapters.findIndex(ch => ch.chapter_number == chapterNumber);
    const prevChapter = chapters[currentIndex - 1] || null;
    const nextChapter = chapters[currentIndex + 1] || null;

    res.render('readChapter', {
      manga,
      currentChapter,
      prevChapter,
      nextChapter
    });

  } catch (err) {
    console.error('Error loading chapter:', err);
    res.status(500).send('Server Error');
  }
};
