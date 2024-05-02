const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Register a new user, POST
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Check if a user with the given username already exists
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    // If a user with the given username already exists, send an error response
    res.status(400).json({ error: 'A user with this username already exists' });
  } else {
    // If no user with the given username exists, insert the new user
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  }
};

// Login, POST
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }   // Redirect to login page if the user is not authenticated
        req.logIn(user, function(err) { 
            if (err) { return next(err); }  
            return res.json({ sessionID: req.sessionID });  // The user is authenticated, send the session ID in the response
        });
    })(req, res, next);
};

// Logout, GET
exports.logout = (req, res) => {
    req.logout();   // Logout the user
    res.redirect('/login');
};


// // User registration route
// app.post('/register', async (req, res) => {
//   const hashedPassword = await bcrypt.hash(req.body.password, 10);
//   const user = new User({
//     username: req.body.username,
//     password: hashedPassword,
//   });
//   await user.save();
//   res.redirect('/login');
// });

// // User login route
// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/',
//   failureRedirect: '/login',
//   failureFlash: true,
// }));