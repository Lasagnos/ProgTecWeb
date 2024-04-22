/* Event model */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    location: String,

    allDay : { type: Boolean, default: false }, // All-day events have no hour/minute component
    start: { type: Date, required: true },      // Date format: "YYYY-MM-DDTHH:MM:SS"
    end: { type: Date, required: true },

    frequency: { type: String, enum: ['none', 'daily', 'daily_ferial', 'weekly', 'monthly', 'monthly_weekday', 'yearly', 'custom'], default: 'none' },
    stopRecurrence: { type: String, enum: ['never', 'date', 'number'], default: 'never' },
    stopDate: { 
        type: Date, 
        required: function() { return this.stopRecurrence === 'date'; },    // Required if stopRecurrence is 'date'
        default: null 
    },
    stopNumber: { 
        type: Number, 
        required: function() { return this.stopRecurrence === 'number'; },  // Required if stopRecurrence is 'number'
        default: null 
    },
    
    completed: { type: Boolean, default: false },
});
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;