const Note = require('../models/Note');
const { marked } = require('marked');   // Markdown library

// Get all notes, GET
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        res.json(notes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single note, GET
exports.getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// create a note, POST
exports.createNote = async (req, res) => {
    try {
        const note = new Note({
            title: req.body.title,
            content: req.body.content,
            categories: req.body.categories,
            createdAt: req.body.createdAt,
            updatedAt: req.body.updatedAt,
            user: req.user._id
        });
        //console.log(note);
        const newNote = await note.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update a note, PUT
exports.updateNote = async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(updatedNote);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Delete a note, DELETE
exports.deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(deletedNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};