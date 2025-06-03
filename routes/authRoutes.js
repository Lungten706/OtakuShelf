const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET landing page
router.get('/', authController.getLanding);

// GET signup page
router.get('/signup', authController.getSignup);

// POST signup form
router.post('/signup', authController.signup);

// GET login page
router.get('/login', authController.getLogin);

// POST login form
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// GET home (protected)
router.get('/home', authController.home);

// GET dashboard (admin only)
router.get('/dashboard', authController.getDashboard);

// GET landing
// router.get('/', authController.getLanding);

// GET email verification
router.get('/verify-email', authController.verifyEmail);

// Forgot password
// GET forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

router.post('/forgot-password', authController.forgotPassword);

// Reset password pages
router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
