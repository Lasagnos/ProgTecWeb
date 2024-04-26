/* Note model */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    heading: String,
    content: String,
    author: String,
    date: { type: Date, default: Date.now },
    place: String,
    tags: {
        type: [String],
        validate: {
            validator: (tags) => tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0),
            message: 'Tutti i tag devono essere stringhe non vuote',
        },
    },
});
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;