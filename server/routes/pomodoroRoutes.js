// pomodoroRoutes.js
const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');

// Start a new pomodoro session
router.post('/start-session', pomodoroController.startSession);

// Update an existing pomodoro session
router.patch('/update-session/:id', pomodoroController.updateSession);

module.exports = router;