const pool = require('../config/db'); // ✅ Correct: using pg Pool
const fs = require('fs');
const path = require('path');
const upload = require('../config/multerConfig');

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
    const mangasResult = await pool.query('SELECT id, title, genres, status FROM manga');
    const mangas = mangasResult.rows;

    let chapters = [];
    let manga = null;

    if (mangaId) {
      const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
      manga = mangaResult.rows[0];

      const chaptersResult = await pool.query(
        `SELECT chapters.*, manga.genres, manga.status
         FROM chapters
         JOIN manga ON chapters.manga_id = manga.id
         WHERE manga_id = $1`,
        [mangaId]
      );
      chapters = chaptersResult.rows;
    } else {
      const chaptersResult = await pool.query(
        `SELECT chapters.*, manga.genres, manga.status
         FROM chapters
         JOIN manga ON chapters.manga_id = manga.id`
      );
      chapters = chaptersResult.rows;
    }

    res.render('chapters', {
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


exports.uploadChapter = async (req, res) => {
  try {
    const { manga_id, chapter_number, title } = req.body;

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    let content_url;

    if (process.env.ON_RENDER === 'true') {
      // ✅ Cloudinary: use hosted file URL
      content_url = req.file.path;
    } else {
      // ✅ Local: sanitize filename and move
      const originalName = req.file.originalname;
      const sanitizedFilename = originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
      const newFilename = Date.now() + '-' + sanitizedFilename;

      const oldPath = req.file.path;
      const newPath = path.join('public/chapterpdfs', newFilename);
      fs.renameSync(oldPath, newPath);

      content_url = '/chapterpdfs/' + newFilename;
    }

    // Save to DB
    await pool.query(
      `INSERT INTO chapters (manga_id, chapter_number, title, content_url, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [manga_id, chapter_number, title, content_url]
    );

    res.redirect('/admin/chapters');
  } catch (error) {
    console.error('Error uploading chapter:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getMangaChapters = async (req, res) => {
  try {
    const { mangaId } = req.params;

    // Get all mangas for the dropdown
    const mangasResult = await pool.query('SELECT id, title FROM manga');
    const mangas = mangasResult.rows;

    // Get selected manga
    const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
    const manga = mangaResult.rows[0];

    if (!manga) {
      return res.status(404).send('Manga not found');
    }

    // Get chapters for the selected manga WITH genres and status from manga table
    const chaptersResult = await pool.query(
      `SELECT chapters.id, chapters.title, chapters.chapter_number, chapters.content_url,
              manga.genres, manga.status
       FROM chapters
       JOIN manga ON chapters.manga_id = manga.id
       WHERE chapters.manga_id = $1
       ORDER BY chapters.chapter_number ASC`,
      [mangaId]
    );

    const chapters = chaptersResult.rows;

    // DEBUG LOG — optional
    // console.log(chapters);

    res.render('chapters', {
      mangas,
      chapters
    });
  } catch (err) {
    console.error('❌ Error in getMangaChapters:', err);
    res.status(500).send('Server error');
  }
};


exports.deleteChapter = async (req, res) => {
  const chapterId = parseInt(req.params.id);

  try {
    const result = await pool.query('SELECT * FROM chapters WHERE id = $1', [chapterId]);
    const chapter = result.rows[0];

    if (!chapter) return res.redirect('/admin/chapters'); // Make sure this is the correct route

    // Delete chapter from DB
    await pool.query('DELETE FROM chapters WHERE id = $1', [chapterId]);

    // Delete PDF file
    if (chapter.pdf_url) {
      const filePath = path.join(
        __dirname,
        '..',
        'public',
        chapter.pdf_url.startsWith('/') ? chapter.pdf_url.slice(1) : chapter.pdf_url
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn(`Failed to delete PDF: ${filePath}`, err.message);
        } else {
          console.log(`Deleted PDF: ${filePath}`);
        }
      });
    }

    res.redirect('/admin/chapters');
  } catch (err) {
    console.error('Error deleting chapter:', err.message);
    res.redirect('/admin/chapters');
  }
};

