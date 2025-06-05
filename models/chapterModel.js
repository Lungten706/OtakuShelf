const pool = require('../config/db');

// Optional: Create chapters table if not exists
const createChaptersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS chapters (
      id SERIAL PRIMARY KEY,
      manga_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      chapter_number INTEGER,
      content_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chapters_manga_id_fkey FOREIGN KEY (manga_id)
        REFERENCES manga(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
    )
  `;
  await pool.query(query);
};

// Add a chapter
const addChapter = async ({ manga_id, title, chapter_number, content_url }) => {
  const query = `
    INSERT INTO chapters (manga_id, title, chapter_number, content_url)
    VALUES ($1, $2, $3, $4) RETURNING *
  `;
  const values = [manga_id, title, chapter_number, content_url];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Get a single chapter by manga ID and chapter number
const getChapter = async (mangaId, chapterNumber) => {
  const result = await pool.query(
    'SELECT * FROM chapters WHERE manga_id = $1 AND chapter_number = $2',
    [mangaId, chapterNumber]
  );
  return result.rows[0];
};

// Get all chapters for a manga
const getAllChapters = async (mangaId) => {
  const result = await pool.query(
    'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
    [mangaId]
  );
  return result.rows;
};

// Delete chapter by ID
const deleteChapterById = async (id) => {
  await pool.query('DELETE FROM chapters WHERE id = $1', [id]);
};

module.exports = {
  createChaptersTable,
  addChapter,
  getChapter,
  getAllChapters,
  deleteChapterById
};
