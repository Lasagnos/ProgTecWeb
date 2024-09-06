const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Register a new user, POST
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Check if a user with the given username already exists
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    res.status(400).json({ error: 'A user with this username already exists' });
  } else {
    // If not, create it
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  }
};

// Login, POST
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => { // Use the local strategy to authenticate the user

        if (err) { return next(err); }

        if (!user) { return res.redirect('/login'); }   // Redirect to login page if the user is not authenticated

        req.logIn(user, function(err) { // Log in the authenticated user
            if (err) { return next(err); }  
            return res.json({ // Send the user information in the response (to turn into a cookie in the client)
              username: user.username,
              id: user._id,
              sessionID: req.sessionID
            });
        });
    })(req, res, next);
};

// Logout, POST
exports.logout = (req, res) => {
  req.logout(err => { // Log out the user
    if (err) {
      console.log(err);
      return res.status(500).json({ message: 'Error logging out' });
    }

    // If no error, the logout was successful
    res.status(200).json({ message: 'Logged out successfully' });
  });
};


// Da Andrea
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