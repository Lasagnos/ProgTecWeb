const mongoose = require('mongoose');

const PomodoroSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  setPomodoroDuration: Number, // Inputs
  setRestDuration: Number,
  setRepetitions: Number,

  maxRepetition: Number, // Last repetition reached

  completed: Boolean, // Was the session completed?

  sessionDuration: Number, // Total time in seconds
  workDuration: Number, // Work time in seconds
  workPercentage: Number,
}, { timestamps: true }); // Adds createdAt field (to get last session)

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema);