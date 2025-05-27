// middleware/authMiddleware.js

const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    res.redirect('/login');
};

module.exports = {
    isLoggedIn,
    isAdmin
};
