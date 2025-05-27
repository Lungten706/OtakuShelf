const User = require('../models/userModel');

const profileController = {
    getProfile: async (req, res) => {
        try {
            const user = await User.getUserProfile(req.session.user.id);
            res.render('profile', { user });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.redirect('/home');
        }
    },

    updateProfile: async (req, res) => {
        try {
            await User.updateProfile(req.session.user.id, req.body);
            res.redirect('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            res.redirect('/profile');
        }
    }
};

module.exports = profileController;
