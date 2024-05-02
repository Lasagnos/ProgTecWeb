/* Note model */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    heading: String,
    content: String,

    creationDate: { type: Date, default: Date.now },
    lastEditDate: { type: Date, default: Date.now },

    tags: {
        type: [String],
        validate: {
            validator: (tags) => tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0),
            message: 'Tutti i tag devono essere stringhe non vuote',
        },
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;