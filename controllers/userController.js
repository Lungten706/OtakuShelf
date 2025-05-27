const pool = require('../config/db'); // ✅ correct path

// Home page logic
exports.home = (req, res) => {
  // Check if user is logged in via session
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirect to login page if not logged in
  }

  // Render home page if logged in
  res.render('home', { user: req.session.userId });
};
const bcrypt = require('bcrypt');// adjust if needed

// Signup controller
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, false]
    );
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Signup failed.');
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = usconst db = require('../config/db');

// View all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, is_admin FROM users ORDER BY id ASC');
    res.render('admin/users', { users: result.rows });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).send('Error fetching users');
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
erResult.rows[0];
    if (!user) return res.send('User not found.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Incorrect password.');

    // Store user ID and is_admin in session
    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin;

    // Redirect based on role
    if (user.is_admin) {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/home');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed.');
  }
};
