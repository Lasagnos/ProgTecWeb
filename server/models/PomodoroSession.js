const mongoose = require('mongoose');

const PomodoroSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  pomodoroDuration: Number, // Inputs
  restDuration: Number,
  repetitions: Number,

  currentRepetition: Number, // Last repetition reached

  completed: Boolean, // Was the session completed?

  totalDuration: Number, // Total time in seconds
  workDuration: Number, // Work time in seconds
  workPercentage: Number,
});

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema);