// controllers/adminController.js
const pool = require('../config/db');

exports.getAdminDashboard = async (req, res) => {
  try {
    // Total mangas
    const mangaResult = await pool.query('SELECT COUNT(*) FROM manga');
    const totalMangas = mangaResult.rows[0].count;

    // Total users
    const userResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = userResult.rows[0].count;

    // Total genres
    const genreResult = await pool.query('SELECT COUNT(*) FROM genres');
    const totalGenres = genreResult.rows[0].count;

    // Recent uploads (latest 5 mangas)
    const recentUploadsResult = await pool.query(
      'SELECT id, title, author, created_at FROM manga ORDER BY created_at DESC LIMIT 5'
    );
    const recentUploads = recentUploadsResult.rows;

    res.render('admin/dashboard', {
      totalMangas,
      totalUsers,
      totalGenres,
      recentUploads
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Error loading dashboard');
  }
};
