const pool = require('../config/db');

// Get a single chapter by manga ID and chapter number
const getChapter = async (mangaId, chapterNumber) => {
  const result = await pool.query(
    'SELECT * FROM chapter WHERE manga_id = $1 AND chapter_number = $2',
    [mangaId, chapterNumber]
  );
  return result.rows[0];
};

// Get all chapters for a manga
const getAllChapters = async (mangaId) => {
  const result = await pool.query(
    'SELECT * FROM chapter WHERE manga_id = $1 ORDER BY chapter_number ASC',
    [mangaId]
  );
  return result.rows;
};

module.exports = {
  getChapter,
  getAllChapters,
};
