const pool = require('../config/db'); // ✅ Correct: using pg Pool

// GET /manga/:mangaId/chapters/:chapterId
exports.viewChapter = async (req, res) => {
    const { mangaId, chapterNumber } = req.params;
    try {
        // Get manga details
        const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
        const manga = mangaResult.rows[0];

        if (!manga) {
            return res.status(404).send('Manga not found');
        }

        // Get all chapters for this manga
        const chaptersResult = await pool.query(
            'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
            [mangaId]
        );
        const chapters = chaptersResult.rows;

        // Get current chapter
        const currentChapter = chapters.find(ch => ch.chapter_number === parseInt(chapterNumber));
        
        if (!currentChapter) {
            return res.status(404).send('Chapter not found');
        }

        // Get prev/next chapter numbers
        const currentIndex = chapters.findIndex(ch => ch.chapter_number === parseInt(chapterNumber));
        const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1].chapter_number : null;
        const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].chapter_number : null;

        res.render('readManga', { 
            manga,
            chapters,
            currentChapter: parseInt(chapterNumber),
            prevChapter,
            nextChapter,
            currentChapterData: currentChapter
        });
    } catch (err) {
        console.error('Error fetching chapter:', err);
        res.status(500).send('Server error');
    }
};
// GET /admin/chapters/edit/:id
exports.editChapterForm = async (req, res) => {
  const { id } = req.params;
  try {
    const chapterResult = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
    const chapter = chapterResult.rows[0];

    const mangasResult = await pool.query('SELECT id, title FROM manga');
    const mangas = mangasResult.rows;

    res.render('editChapter', { chapter, mangas });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Server error');
  }
};

// GET /admin/chapters or /admin/chapters?manga_id=1
exports.getChapters = async (req, res) => {
  try {
    const mangaId = req.query.manga_id;
    const mangasResult = await pool.query('SELECT id, title FROM manga');
    const mangas = mangasResult.rows;

    let chapters = [];
    let manga = null;

    if (mangaId) {
      const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
      manga = mangaResult.rows[0];

      const chaptersResult = await pool.query('SELECT * FROM chapters WHERE manga_id = $1', [mangaId]);
      chapters = chaptersResult.rows;
    } else {
      const chaptersResult = await pool.query('SELECT * FROM chapters');
      chapters = chaptersResult.rows;
    }

    res.render('chapters', {
      manga,
      mangas,
      chapters
    });
  } catch (err) {
    console.error('❌ Error in getChapters:', err);
    res.status(500).send('Server error');
  }
};

// POST /admin/chapters - Add chapter
exports.addChapter = async (req, res) => {
  const { title, manga_id } = req.body;
  try {
    await pool.query('INSERT INTO chapters (title, manga_id) VALUES ($1, $2)', [title, manga_id]);
    res.redirect('/admin/chapters');
  } catch (error) {
    console.error('Error adding chapter:', error);
    res.status(500).send('Server Error');
  }
};

// GET /admin/chapters/upload
exports.uploadChapter = async (req, res) => {
    try {
        const { manga_id, chapter_number, title } = req.body;
        const content_url = req.file ? `/chapterpdfs/${req.file.filename}` : null;

        await pool.query(
            'INSERT INTO chapters (manga_id, title, chapter_number, content_url, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [manga_id, title, chapter_number, content_url]
        );

        res.redirect(`/manga/${manga_id}/chapters`);
    } catch (err) {
        console.error('Error uploading chapter:', err);
        res.status(500).send('Error uploading chapter');
    }
};
exports.getMangaChapters = async (req, res) => {
    try {
        const { mangaId } = req.params;
        
        // Get manga details
        const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
        const manga = mangaResult.rows[0];

        if (!manga) {
            return res.status(404).send('Manga not found');
        }

        // Get chapters for this manga
        const chaptersResult = await pool.query(
            'SELECT id, title, chapter_number, content_url FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
            [mangaId]
        );
        const chapters = chaptersResult.rows;

        res.render('readManga', { manga, chapters });
    } catch (err) {
        console.error('Error fetching manga chapters:', err);
        res.status(500).send('Server error');
    }
};

// DELETE /admin/chapters/:id
exports.deleteChapter = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM chapters WHERE id = $1', [id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).send('Server Error');
  }
};
