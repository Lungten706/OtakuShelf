const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Landing page
router.get('/', authController.getLanding);

// Signup & Login pages (GET)
router.get('/signup', authController.getSignup);
router.get('/login', authController.getLogin);

// Signup & Login handling (POST)
router.post('/signup', authController.signup); // ✅ renamed
router.post('/login', authController.login);   // ✅ renamed

// Home (protected)
router.get('/home', authController.home);

// Dashboard (optional): this controller does not exist, so use inline or create one
router.get('/dashboard', authController.getDashboard); // ⛔ PROBLEM LINE


// Logout route
router.get('/logout', authController.logout);

module.exports = router;
