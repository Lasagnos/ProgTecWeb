const express = require("express");
const app = express();  //Express App
const mongoose = require("mongoose");   // MongoDB interaction
const path = require('path');   // Handles file paths
const _ = require("lodash");    // Utility library
const cors = require('cors');    // Cross-origin resource sharing middleware
//const { logRequest, errorHandler, checkAuthentication } = require('./customMiddleware');
app.use(cors());

// // Set the view engine to EJS
// app.set("view engine", "ejs");

// Add middleware for parsing JSON and urlencoded data and populating `req.body`
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));


// Database connection
const mongoDBUri = "mongodb+srv://Anglos:gelsomino02@cluster0.hxn6lak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
//const db = mongoose.connection;


// IMPORT ROUTES
const eventRoutes = require('./routes/eventRoutes');
app.use('/events', eventRoutes);
// IMPORT MODELS
const Event = require('./models/Event');


// Content variables
const homeContent = "CALENDARIO";
const aboutContent = "SOSTITUIRE CON NOTE O POMODORO";
const contactContent = "SOSTITUIRE CON NOTE O POMODORO";


// ALL ROUTES

// --- Generic routes --- //    Ricordarsi di mettere route non dinamiche PRIMA di una dinamica ;)

// Compose route to handle new Events: saves them to the database and redirects to the home page
app.post("/compose", async (req, res) => {
    console.log('Yo');
    console.log('Received new event: ', req.body);
    const newEvent = new Event({
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,

        allDay: req.body.allDay,
        start: req.body.start,
        end: req.body.end,

        frequency: req.body.frequency,
        stopRecurrence: req.body.stopRecurrence,
        stopDate: req.body.stopDate,
        stopNumber: req.body.stopNumber,
        
        completed: req.body.completed
    });
    try {
        await newEvent.save();
        res.status(200).send('Event saved');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving new event');
    }
});

// // Search route to fetch blog posts that match the search query from database and return them as JSON
// app.get('/search', async (req, res) => {
//     if (!req.query.query) {
//         return res.status(400).send('Query parameter is required');
//     }

//     try {
//         const query = req.query.query; // This explicitly fetches the 'query' parameter from the request URL
//         const searchResults = await Blog.find({
//             heading: { $regex: new RegExp(query, 'i') }
//         }).limit(5);
//         res.json(searchResults);
//     } catch (error) {
//         console.error('Search error:', error);
//         res.status(500).send('Error performing search');
//     }
// });


// // --- Dynamic routes --- //

// // Post route to fetch a single blog post by its name (matching heading) from the database
// app.get("/posts/:postName", async (req, res) => {
//     try {
//         const postName = decodeURIComponent(req.params.postName);  // Explicitly decode, though Express does it
//         const post = await Blog.findOne({ heading: new RegExp('^' + _.escapeRegExp(postName) + '$', 'i') });
//         if (post) {
//             res.render("posts", {
//                 id : post._id,
//                 title: post.heading,
//                 post: post.content,
//                 author: post.author,
//                 date: post.date,
//                 place: post.place,
//                 tags: post.tags
//             });
//         } else {
//             res.status(404).send('Post not found');
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error fetching post');
//     }
// });

// // Deletion route to delete a blog post by its ID from the database
// app.post('/posts/delete/:id', async (req, res) => {
//     try {
//         const result = await Blog.findByIdAndDelete(req.params.id);
//         if (!result) {
//             return res.status(404).send('Post not found');
//         }
//         res.redirect('/'); // Redirect to the homepage or another appropriate page
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error deleting post');
//     }
// });


// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});