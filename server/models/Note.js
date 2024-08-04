/* Note model */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,

    createdAt: Date,
    updatedAt: Date,

    categories: [String],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;