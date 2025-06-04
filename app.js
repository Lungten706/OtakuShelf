// app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const session = require('express-session');
const helmet = require('helmet');
const flash = require('connect-flash');
const Manga = require('./models/manga')


const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeRoutes = require('./routes/homeRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const readRoutes = require('./routes/readRoutes');


// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (adjust settings for production)
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,             // set true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Make flash messages available in all EJS views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from /public
app.use(express.static('public'));
app.use('/mangauploads', express.static(path.join(__dirname, 'mangauploads')));
// Add this line if it's not already present
app.use('/chapterpdfs', express.static('public/chapterpdfs'));


// Routes setup

app.use('/', authRoutes);
app.use('/', mangaRoutes);
app.use('/', adminRoutes);
app.use('/', homeRoutes);
app.use('/', chapterRoutes); 
app.use('/', readRoutes);

// Catch-all 404 page (optional)
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

Manga.createTableIfNotExists();

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
