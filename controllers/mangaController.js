const pool = require('../config/db');

// Handle favicon requests
exports.handleFavicon = (req, res) => {
    res.status(204).end();
};

// Render Manga Admin Page

exports.renderMangaAdminPage = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM manga ORDER BY created_at DESC');
        const mangas = result.rows;

        console.log('Fetched manga:', mangas); // Debug log

        res.render('manga', { 
            mangas: mangas || [],
            user: req.session.user 
        });
    } catch (err) {
        console.error('Error fetching manga:', err);
        res.render('manga', { 
            mangas: [],
            user: req.session.user 
        });
    }
};
// Add new manga - Updated route handler
exports.addManga = async (req, res) => {
    try {
        const { title, author, genres, status, chapters } = req.body;
        const cover_url = req.file ? `/mangauploads/${req.file.filename}` : null;

        await pool.query(
            'INSERT INTO manga (title, author, cover_url, genres, status, chapters, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
            [title, author, cover_url, genres, status, chapters]
        );

        res.redirect('/manga');
    } catch (err) {
        console.error('Error uploading manga:', err);
        res.status(500).send('Error uploading manga');
    }
};


// Get All Manga List (User side or generic)
exports.getMangaList = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM manga ORDER BY created_at DESC');
        res.render('home', { 
            mangas: result.rows,
            user: req.session.user 
        });
    } catch (err) {
        console.error('Error fetching manga list:', err);
        res.render('home', { 
            mangas: [],
            user: req.session.user 
        });
    }
};


// Get Manga by ID with basic validation
exports.getMangaById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id < 1) {
            return res.redirect('/manga');
        }

        const result = await pool.query('SELECT * FROM manga WHERE id = $1', [id]);
        const manga = result.rows[0];

        if (!manga) {
            return res.redirect('/manga');
        }

        // You can fetch chapters here if needed
        const chaptersResult = await pool.query(
            'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number',
            [id]
        );

        res.render('readManga', {
            manga,
            chapters: chaptersResult.rows
        });
    } catch (error) {
        console.error('Manga Details Error:', error);
        res.redirect('/manga');
    }
};


// Get Manga Details + Chapters
exports.getMangaDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [id]);
        const manga = mangaResult.rows[0];

        if (!manga) {
            return res.status(404).send('Manga not found');
        }

        const chaptersResult = await pool.query(
            'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number',
            [id]
        );

        res.render('readManga', {
            manga,
            chapters: chaptersResult.rows
        });
    } catch (error) {
        console.error('Manga Details Error:', error);
        res.status(500).send('Error loading manga details');
    }
};
const fs = require('fs');
const path = require('path');

exports.deleteManga = async (req, res) => {
    const mangaId = parseInt(req.params.id);

    try {
        const result = await pool.query('SELECT * FROM manga WHERE id = $1', [mangaId]);
        const manga = result.rows[0];

        if (!manga) return res.redirect('/manga');

        await pool.query('DELETE FROM manga WHERE id = $1', [mangaId]);

        if (manga.cover_url) {
            const filePath = path.join(__dirname, '..', 'public', manga.cover_url.startsWith('/') ? manga.cover_url.slice(1) : manga.cover_url);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.warn(`Failed to delete image: ${filePath}`, err.message);
                } else {
                    console.log(`Deleted image: ${filePath}`);
                }
            });
        }

        res.redirect('/manga');
    } catch (err) {
        console.error('Error deleting manga:', err.message);
        res.redirect('/manga');
    }
};

