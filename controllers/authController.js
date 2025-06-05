const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware to block access to login/signup if already logged in
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) return res.redirect('/home');
  next();
};

// Render signup/login pages
exports.getSignup = [exports.isAuthenticated, (req, res) => res.render('signup', { message: null })];
exports.getLogin = [exports.isAuthenticated, (req, res) => res.render('login', { error: null })];

// Signup handler
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.render('signup', { message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a JWT verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Save user with token (but not yet verified)
    await pool.query(`
      INSERT INTO users (username, email, password, is_admin, verification_token)
      VALUES ($1, $2, $3, $4, $5)
    `, [name, email, hashedPassword, role === 'admin', verificationToken]);

    // Send verification link
    // Send verification link
    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"OtakuShelf" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `<h3>Hello ${name},</h3><p>Please verify your email by clicking below:</p><a href="${verificationLink}">Verify Email</a>`
    });


    res.render('signup', { message: 'Signup successful! Please check your email to verify your account.' });

  } catch (error) {
    console.error('Signup Error:', error);
    res.render('signup', { message: 'Server error. Please try again later.' });
  }
};

// Email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const result = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE email = $1 AND is_verified = false RETURNING *',
      [email]
    );

    if (result.rows.length === 0) {
      return res.send('❌ Invalid or already verified email.');
    }

    return res.redirect('/login?verified=true');

  } catch (err) {
    console.error('Verification Error:', err);
    return res.send('❌ Link expired or invalid.');
  }
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Admin login check
    if (email === process.env.ADMIN_EMAIL) {

      const isAdminPasswordMatch = await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH.trim()
      );
      console.log("6️⃣ Password match result:", isAdminPasswordMatch);



      if (!isAdminPasswordMatch) {
        return res.render('login', { error: 'Invalid email or password' });
      }

      req.session.user = {
        id: 'admin-fallback',
        email,
        isAdmin: true,
      };

      return res.redirect('/dashboard');
    }

    // 2. Regular DB-based login
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.render('login', { error: 'Please verify your email before logging in.' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    };

    return user.is_admin ? res.redirect('/dashboard') : res.redirect('/home');

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).render('login', { error: 'Login failed. Try again later.' });
  }
};


// Forgot password: request reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (result.rows.length === 0) return res.send('Email not registered');

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [token, expiry, email]
    );

    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;


    await transporter.sendMail({
      from: `"OtakuShelf" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click the link to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    });

    res.send('Reset link sent');

  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.send('Failed to send reset link');
  }
};

// Render reset password page
exports.getResetPassword = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [token, new Date()]
    );

    if (result.rows.length === 0) {
      return res.send('Invalid or expired token');
    }

    res.render('reset-password', { token });

  } catch (err) {
    console.error('Reset Page Error:', err);
    res.send('Error loading reset page');
  }
};

// Handle new password submission
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) return res.send('Passwords do not match');

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, token_expiry = NULL WHERE reset_token = $2',
      [hashed, token]
    );

    //res.send('✅ Password reset successfully');
    req.flash('success', '✅ Your password has been reset. Please log in.');
    res.redirect('/login');

  } catch (err) {
    console.error('Password Reset Error:', err);
    res.send('Failed to reset password');
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout Error:', err);
    res.redirect('/login');
  });
};

// Landing page
exports.getLanding = async (req, res) => {
  try {
    const mangas = await pool.query('SELECT * FROM manga ORDER BY created_at DESC LIMIT 6');
    console.log('Fetched mangas for landing:', mangas.rows);
    res.render('landing', {
      user: req.session.user,
      mangas: mangas.rows
    });
  } catch (err) {
    console.error('Home Error:', err);
    res.render('landing', {
      user: req.session.user,
      mangas: []
    });
  }
};



// Home for users
exports.home = async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const mangas = await pool.query('SELECT * FROM manga ORDER BY created_at DESC LIMIT 6');
    res.render('home', {
      user: req.session.user,
      mangas: mangas.rows
    });
  } catch (err) {
    console.error('Home Error:', err);
    res.render('home', {
      user: req.session.user,
      mangas: []
    });
  }
};

// Admin Dashboard
exports.getDashboard = async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) return res.redirect('/login');

  try {
    const mangaCount = await pool.query('SELECT COUNT(*) FROM manga');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const genreCount = await pool.query('SELECT COUNT(DISTINCT genres) FROM manga');
    const recentUploads = await pool.query(
      'SELECT title, cover_url, author, created_at FROM manga ORDER BY created_at DESC LIMIT 5'
    );

    res.render('dashboard', {
      user: req.session.user,
      totalMangas: parseInt(mangaCount.rows[0].count),
      totalUsers: parseInt(userCount.rows[0].count),
      totalGenres: parseInt(genreCount.rows[0].count),
      recentUploads: recentUploads.rows
    });

  } catch (err) {
    console.error('Dashboard Error:', err);
    res.render('dashboard', {
      user: req.session.user,
      totalMangas: 0,
      totalUsers: 0,
      totalGenres: 0,
      recentUploads: []
    });
  }
};
