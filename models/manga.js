const db = require('../config/db');

const Manga = {
  getAllManga: async () => {
    try {
      const result = await db.any(
        'SELECT id, title, author, cover_url, chapters, status FROM manga ORDER BY created_at DESC'
      );
      console.log('✅ Manga fetched from DB:', result.length, result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching manga:', error);
      return [];
    }
  },

  addManga: async ({ title, author, chapters, status, cover_url }) => {
    try {
      await db.none(
        `INSERT INTO manga (title, author, chapters, status, cover_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [title, author, chapters, status, cover_url]
      );
      console.log('✅ Manga added');
    } catch (err) {
      console.error('❌ Error in addManga:', err);
    }
  }
};

module.exports = Manga;
