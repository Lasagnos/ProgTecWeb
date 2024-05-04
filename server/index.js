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
const MongoDBStore = require('connect-mongodb-session')(session); // MongoDB session store
const crypto = require('crypto'); // Cryptographic library for generating random strings (built-in to Node.js)


/* MIDDLEWARE */

// Enable CORS for all routes, and allow credentials (cookies)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Add middleware for parsing JSON, urlencoded data and serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/public')));

// Generate a secret key for the session (one-time only, currently stored in .env file)
// const secretKey = crypto.randomBytes(64).toString('hex');
// console.log(secretKey);

// SET UP THE MONGO URI
const mongoURIforTesting = '';  // ADD YOUR OWN MONGODB URI HERE
const MONGODB_URI = process.env.MONGODB_URI || mongoURIforTesting;

// Create a new MongoDBStore instance for storing sessions in MongoDB
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'mySessions'
});

// Enable express-session, a session middleware for Express
app.use(session({
  secret: process.env.SESSION_SECRET  || 'DEFAULT_SECRET_KEY_HERE_FOR_TESTING',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,  // problematic!
    sameSite: 'None', // problematic!
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  },
  store: store
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
// User serialization and deserialization. Used to store the user in the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Custom middleware to ensure that a user is authenticated. Used in 'private' routes
const { ensureAuthenticated } = require('./middleware/customMiddlewares');


/* DATABASE CONNECTION */
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }); // Properties to use new node.js engines
//const db = mongoose.connection;



/* IMPORT MODELS */
const Event = require('./models/Event');
const User = require('./models/User');
const Note = require('./models/Note');
const Todo = require('./models/Todo');
/* IMPORT ROUTES */
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/event', ensureAuthenticated, eventRoutes);
const todosRoutes = require('./routes/todosRoutes');
app.use('/api/todos', ensureAuthenticated, todosRoutes);



/* ALL ROUTES */  // Mostly debugs, try to move the real ones all to routes folder

// app.get('/api/test', (req, res) => {   // DEBUG
//   res.json({ user: req.user });
// });

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname+'/../client/public/index.html'));
// });




/* Start the server */
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});