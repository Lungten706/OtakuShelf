// app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const session = require('express-session');
const helmet = require('helmet');
const flash = require('connect-flash');

const User = require('./models/userModel');
const Manga = require('./models/manga');
const Chapter = require('./models/chapterModel');

const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeRoutes = require('./routes/homeRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const readRoutes = require('./routes/readRoutes');

// Load environment variables from .env file
dotenv.config();
console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? '[SET]' : '[NOT SET]');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use('/mangauploads', express.static(path.join(__dirname, 'mangauploads')));
app.use('/chapterpdfs', express.static('public/chapterpdfs'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes setup
app.use('/', authRoutes);
app.use('/', mangaRoutes);
app.use('/', adminRoutes);
app.use('/', homeRoutes);
app.use('/', chapterRoutes);
app.use('/', readRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

// Ensure tables are created and start the server
(async () => {
  try {
    await User.createUsersTable();
    await Manga.createTableIfNotExists();
    await Chapter.createChaptersTable();
    console.log("✅ All tables checked/created");

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
})();
