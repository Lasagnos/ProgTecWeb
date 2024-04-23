/* Event Controller */

const Event = require('../models/Event');

// Get all events, GET
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching events');
    }
};

// Get a single event, GET
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching event');
    }
};

// Create a new event, POST
exports.createEvent = async (req, res) => {
    const newEvent = new Event(req.body);
    try {
        await newEvent.save();
        res.status(201).json(newEvent); // Return the new event
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving event');
    }
};

// Update an event, PUT
exports.updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) {
            return res.status(404).send('Event not found');
        }
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating event');
    }
};

// Delete an event, DELETE
exports.deleteEvent = async (req, res) => {
    try {
        const result = await Event.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send('Event not found');
        }
        res.status(204).send('Event deleted'); // 204: No Content
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting event');
    }
};