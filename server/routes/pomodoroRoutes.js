// pomodoroRoutes.js
const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');

// Start a new pomodoro session
router.post('/start-session', pomodoroController.startSession);

// Update an existing pomodoro session
router.patch('/update-session/:id', pomodoroController.updateSession);

// Get the last pomodoro session (added for home component)
router.get('/last-session', pomodoroController.getLastSession);

module.exports = router;