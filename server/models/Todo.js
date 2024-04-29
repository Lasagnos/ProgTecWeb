/* Event model */

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    todo: { type: String, required: true },

    creationDate: { type: Date, default: Date.now },    // implicit, should not be altered
    dueDate: { type: Date, required: true },
    
    completed: { type: Boolean, default: false },
});
const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;