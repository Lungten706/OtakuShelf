const pool = require('../config/db');

// GET /admin/genres - Show all genres
exports.getGenres = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY id ASC');
    res.render('genres', { genres: result.rows });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).send('Server Error');
  }
};

// POST /admin/genres - Add new genre
exports.addGenre = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO genres (name) VALUES ($1)', [name]);
    res.redirect('/admin/genres');
  } catch (error) {
    console.error('Error adding genre:', error);
    res.status(500).send('Server Error');
  }
};

// DELETE /admin/genres/:id - Delete genre
exports.deleteGenre = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM genres WHERE id = $1', [id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting genre:', error);
    res.status(500).send('Server Error');
  }
};
