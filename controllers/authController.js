const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Middleware: Redirect logged-in users away from login/signup pages
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/home');
  }
  next();
};

// Render signup page
exports.getSignup = [exports.isAuthenticated, (req, res) => {
  res.render('signup');
}];

// Render login page
exports.getLogin = [exports.isAuthenticated, (req, res) => {
  res.render('login');
}];

// Handle user signup
exports.signup = async (req, res) => {
  const { name, email, password, isAdmin, adminCode } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return res.render('signup', { error: 'Email already in use' });
    }

    const is_admin = isAdmin && adminCode === process.env.ADMIN_REGISTRATION_CODE;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, is_admin]
    );

    res.redirect('/login');
  } catch (err) {
    console.error('Signup error:', err);
    res.render('signup', { error: 'Server error' });
  }
};

// Handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    };

    if (user.is_admin) {
      return res.redirect('/dashboard');
    } else {
      return res.redirect('/home');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', { error: 'Login failed' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/home');
    }
    res.redirect('/login');
  });
};

// Landing page (optional)
exports.getLanding = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.render('landing');
  });
};

// Home (protected)
exports.home = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const result = await pool.query('SELECT * FROM manga ORDER BY created_at DESC LIMIT 6');
    res.render('home', {
      user: req.session.user,
      mangas: result.rows || []
    });
  } catch (err) {
    console.error('Error fetching manga for home:', err);
    res.render('home', {
      user: req.session.user,
      mangas: []
    });
  }
};

// Admin Dashboard
exports.getDashboard = async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect('/login');
  }

  try {
    const mangaCountResult = await pool.query('SELECT COUNT(*) FROM manga');
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const genreCountResult = await pool.query('SELECT COUNT(DISTINCT genres) FROM manga');

    const recentUploads = await pool.query(
      'SELECT title, author, created_at FROM manga ORDER BY created_at DESC LIMIT 5'
    );

    res.render('dashboard', {
      user: req.session.user,
      totalMangas: parseInt(mangaCountResult.rows[0].count) || 0,
      totalUsers: parseInt(userCountResult.rows[0].count) || 0,
      totalGenres: parseInt(genreCountResult.rows[0].count) || 0,
      recentUploads: recentUploads.rows || []
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.render('dashboard', {
      user: req.session.user,
      totalMangas: 0,
      totalUsers: 0,
      totalGenres: 0,
      recentUploads: []
    });
  }
};
