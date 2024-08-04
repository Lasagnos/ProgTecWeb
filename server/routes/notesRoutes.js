const express = require('express');
const router = express.Router();
const noteController = require('../controllers/notesController');

// Get all notes
router.get('/', noteController.getNotes);

// Get a single note by ID
router.get('/:id', noteController.getNote);

// Create a new note
router.post('/write', noteController.createNote);

// Update an existing note
router.put('/write/:id', noteController.updateNote);

// Delete a note
router.delete('/:id', noteController.deleteNote);

module.exports = router;