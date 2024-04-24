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
app.use('/event', eventRoutes);
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
    console.log('Received event: ', req.body);
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


// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});