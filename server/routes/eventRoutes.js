const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getEvents);

// Get a single event by ID
router.get('/:id', eventController.getEvent);

// Create a new event
router.post('/write', eventController.createEvent);

// Update an existing event
router.put('/write/:id', eventController.updateEvent);

// Delete an event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;