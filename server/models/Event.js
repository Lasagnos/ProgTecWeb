/* Event model */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    location: String,

    allDay : { type: Boolean, default: false }, // All-day events have no hour/minute component
    start: { type: Date, required: true },      // Date format: "YYYY-MM-DDTHH:MM:SS"
    end: { type: Date, required: true },

    frequency: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'monthly_weekday', 'yearly', 'custom'], default: 'none' },
    customFrequency: {
        type: { type: String, enum: ['daily', 'weekly', 'monthly', 'monthly_weekday', 'yearly'], required: true },
        frequency: { type: Number, default: null }, // Frequency based on the type

        daysOfWeek: [Number], // Days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        
        daysOfMonth: [Number], // Days of the month (1, 2, ..., 31)

        weekOfMonth: {
            nthWeek: { type: Number, default: null }, // Week of the month (1 = first week, 2 = second week, ..., -1 = last week)
            nthWeekday: { type: Number, default: null }, // Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        },

        monthsOfYear: [Number], // Months of the year (1 = January, 2 = February, ..., 12 = December)
    },

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

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;