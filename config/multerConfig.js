const multer = require('multer');
const path = require('path');
const pool = require('../config/db');

// ✅ Helper to slugify titles
function slugify(title) {
  return title.toString().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // Replace non-alphanumeric characters with hyphen
    .replace(/^-+|-+$/g, '');      // Trim hyphens from start and end
}

// ✅ Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, 'public/chapterpdfs/');
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, 'public/mangauploads/');
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },

  filename: async function (req, file, cb) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      let baseName;

      if (file.mimetype === 'application/pdf') {
        const mangaId = req.body.manga_id;
        const chapterNumber = req.body.chapter_number || '1';
        let mangaTitle = 'UnknownManga';

        if (mangaId) {
          const result = await pool.query('SELECT title FROM manga WHERE id = $1', [mangaId]);
          mangaTitle = result.rows[0]?.title || 'UnknownManga';
        }

        const slugTitle = slugify(mangaTitle);
        baseName = `${slugTitle}-ch-${chapterNumber}`;
      } else if (file.mimetype.startsWith('image/')) {
        const rawTitle = req.body.title || 'cover';
        const slugTitle = slugify(rawTitle);
        baseName = `${slugTitle}-cover`;
      } else {
        baseName = `file-${Date.now()}`;
      }

      cb(null, `${baseName}${ext}`);
    } catch (err) {
      console.error('Filename generation error:', err);
      cb(new Error('Failed to generate file name'), false);
    }
  }
});

// ✅ File type filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  console.log('Received file:', file.originalname);
  console.log('Extension:', extname);
  console.log('MIME type:', mimetype);

  const isImage = mimetype.startsWith('image/') && allowedImageTypes.test(extname);
  const isPdf = mimetype === 'application/pdf';

  if (isPdf || isImage) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files and valid image types are allowed!'), false);
  }
};

// ✅ Multer upload middleware
const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
