require('dotenv').config({ path: '../.env' }); // Load environment variables. Used for security
const express = require("express");
const app = express();  //Express App
const mongoose = require("mongoose");   // MongoDB interaction
const path = require('path');   // Handles file paths
const _ = require("lodash");    // Utility library
const cors = require('cors');    // Cross-origin resource sharing middleware
const passport = require("passport"); // Authentication middleware
const LocalStrategy = require("passport-local").Strategy; // Local authentication strategy for Passport
const bcrypt = require("bcrypt"); // Password hashing library
const session = require('express-session'); // Session middleware for Express
const crypto = require('crypto'); // Cryptographic library for generating random strings (built-in to Node.js)


/* MIDDLEWARE */

app.use(cors());  // Enable CORS

// Add middleware for parsing JSON, urlencoded data and serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/public')));

//const { errorHandler } = require('./customMiddleware');

// Generate a secret key for the session
// const secretKey = crypto.randomBytes(64).toString('hex');
// console.log(secretKey);

// Enable express-session, a session middleware for Express
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {  // Compare the password with the hashed password
      return done(null, false, { message: "Incorrect username or password." });
    }
    return done(null, user);
  })
);
// User serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});



/* DATABASE CONNECTION */

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//const db = mongoose.connection;



/* IMPORT ROUTES */
const eventRoutes = require('./routes/eventRoutes');
app.use('/event', eventRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

/* IMPORT MODELS */
const Event = require('./models/Event');
const User = require('./models/User');
const Note = require('./models/Note');
const Todo = require('./models/Todo');


/* ALL ROUTES */

// User registration route
app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    username: req.body.username,
    password: hashedPassword,
  });
  await user.save();
  res.redirect('/login');
});

// User login route
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



/* Start the server */
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});