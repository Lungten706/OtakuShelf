// app.js

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const session = require('express-session');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeRoutes = require('./routes/homeRoutes');
const chapterRoutes = require('./routes/chapterRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 7000;

// Security middleware
app.use(helmet());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (adjust settings for production)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from /public
app.use(express.static('public'));
app.use('/mangauploads', express.static(path.join(__dirname, 'public/mangauploads')));
// Add this line if it's not already present
app.use('/chapterpdfs', express.static('public/chapterpdfs'));


// Routes setup

app.use('/', authRoutes);
app.use('/', mangaRoutes);
app.use('/', adminRoutes);
app.use('/', homeRoutes);
app.use('/', chapterRoutes); 

// Catch-all 404 page (optional)
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
