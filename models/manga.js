const db = require('../config/db');

const Manga = {
  getAllManga: async () => {
    try {
      const result = await db.query(
        'SELECT id, title, author, cover_url, chapters, status FROM manga ORDER BY created_at DESC'
      );
      console.log('✅ Manga fetched from DB:', result.rowCount);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching manga:', error);
      return [];
    }
  },

  addManga: async ({ title, author, chapters, status, cover_url, genres }) => {
  try {
    await db.none(
      `INSERT INTO manga (title, author, chapters, status, cover_url, genres, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [title, author, chapters, status, cover_url, genres] // genres must be a JS array
    );
    console.log('✅ Manga added');
  } catch (err) {
    console.error('❌ Error in addManga:', err);
  }
},

  createTableIfNotExists: async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS manga (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255),
          cover_url TEXT,
          chapters INTEGER,
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ manga table checked/created');
    } catch (err) {
      console.error('❌ Error creating manga table:', err);
    }
  }
};

module.exports = Manga;
