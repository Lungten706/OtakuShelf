const multer = require('multer');
const path = require('path');
const slugify = require('slugify');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Route based on file type
    if (file.mimetype === 'application/pdf') {
      cb(null, 'public/chapterpdfs/');
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, 'public/mangauploads/');
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    
    // Default base name (fallback)
    let baseName = Date.now().toString();

    if (file.mimetype === 'application/pdf') {
      // Expecting manga_title and chapter_number for chapters
      const mangaTitle = slugify(req.body.manga_title || 'manga', { lower: true });
      const chapterNumber = req.body.chapter_number || '1';
      baseName = `${mangaTitle}_ch${chapterNumber}`;
    } else if (file.mimetype.startsWith('image/')) {
      // Expecting manga_title for cover images
      const mangaTitle = slugify(req.body.title || 'cover', { lower: true });
      baseName = `${mangaTitle}_cover`;
    }

    cb(null, `${baseName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images and PDF
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files and images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
