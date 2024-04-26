const User = require('../models/User');
const bcrypt = require('bcrypt');

// Register a new user, POST
exports.register = async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);    // Hash the password
    const user = new User({
        username: req.body.username,
        password: hashedPassword,
    });
    await user.save();  // Save the new user
    res.redirect('/login');
};

// Login, POST
exports.login = (req, res, next) => {
    passport.authenticate('local', {    
        successRedirect: '/',       // Redirect to the home page if the login is successful
        failureRedirect: '/login',  // Redirect to the login page if the login fails
        failureFlash: true,
    })(req, res, next);
};

// Logout, GET
exports.logout = (req, res) => {
    req.logout();   // Logout the user
    res.redirect('/login');
};