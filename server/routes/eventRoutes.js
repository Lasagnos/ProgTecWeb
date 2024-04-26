const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getEvents);

// Get a single event by ID
router.get('/:id', eventController.getEvent);

// Create a new event
router.post('/', eventController.createEvent);

// Update an existing event
router.put('/:id', eventController.updateEvent);

// Delete an event
router.delete('/:id', eventController.deleteEvent);

// Compose route to handle new Events: saves them to the database and redirects to the home page
router.post('/compose', eventController.createEvent);

module.exports = router;