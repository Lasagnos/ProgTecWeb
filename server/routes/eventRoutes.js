/* Event Routes */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/events', eventController.getEvents);

// Get a single event by ID
router.get('/events/:id', eventController.getEvent);

// Create a new event
router.post('/events', eventController.createEvent);

// Update an existing event
router.put('/events/:id', eventController.updateEvent);

// Delete an event
router.delete('/events/:id', eventController.deleteEvent);

module.exports = router;