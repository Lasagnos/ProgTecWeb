const Event = require('../models/Event');
const { checkOwnership } = require('../middleware/customMiddlewares');

// Get all events, GET
exports.getEvents = (req, res) => {
    Event.find({ user: req.user._id })  // Fetch all events of the authenticated user
        .then(events => res.json(events))
        .catch(err => res.status(500).json({ error: err.message }));
  };

// Get a single event, GET
exports.getEvent = (req, res) => {
    Event.findById(req.params.id)   // Fetch a single event by its ID
        .then(event => {
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json(event);    // Send the event in the response
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

// Update an event, PUT
exports.updateEvent = (req, res) => {
    Event.findByIdAndUpdate(req.params.id, req.body, { new: true }) // Find the event by ID and update it. Return the new, modified event
        .then(event => {
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json(event);    // Send the new, modified event in the response
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

// Delete an event, DELETE
exports.deleteEvent = (req, res) => {
    Event.findByIdAndDelete(req.params.id)  // Find the event by ID and delete it
        .then(event => {
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json(event);    // Send the deleted event in the response
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

// Compose route used to create new events
// Create a new event, POST
exports.createEvent = async (req, res) => {
    try {
      const newEvent = new Event({
        ...req.body,    // the rest is all the same
        user: req.user._id, //  Set the user ID of the authenticated user
      });
      const savedEvent = await newEvent.save();
  
      res.json(savedEvent); // Send the saved event in the response
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };