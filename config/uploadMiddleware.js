const multer = require('multer');
const { storage: cloudinaryStorage } = require('./cloudinary');
const localStorage = require('./multerConfig');
const dotenv = require('dotenv');

dotenv.config();

const isRender = process.env.ON_RENDER === 'true';

// Use Cloudinary storage on Render, local storage otherwise
const storage = isRender ? cloudinaryStorage : localStorage.storage;

const upload = multer({ storage });

module.exports = upload;
