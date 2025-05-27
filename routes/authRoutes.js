const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Landing page
router.get('/', (req, res) => res.render('landing')); // assuming you have landing.ejs

// Signup & Login pages (GET)
router.get('/signup', (req, res) => res.render('signup'));
router.get('/login', (req, res) => res.render('login'));

// Signup & Login handling (POST)
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Home & Dashboard pages (protected)
router.get('/home', authController.home);
router.get('/dashboard', authController.getDashboard);


// Logout route
router.get('/logout', authController.logout);

module.exports = router;
