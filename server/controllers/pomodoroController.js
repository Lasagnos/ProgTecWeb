const PomodoroSession = require('../models/PomodoroSession');

// Start a new pomodoro session, POST
exports.startSession = async (req, res) => {
    try {
        const session = new PomodoroSession({
            ...req.body,
            user: req.user._id, // Add the current user to the body
            currentRepetition: 1, // Initialize currentRepetition to 1
            totalDuration: req.body.pomodoroDuration * req.body.repetitions + req.body.restDuration * (req.body.repetitions - 1), // Calculate totalDuration
            workDuration: 0, // Initialize workDuration to 0
            workPercentage: 0, // Initialize workPercentage to 0
        });
        await session.save();
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while starting the session' });
    }
};

// Update an existing pomodoro session, PATCH
exports.updateSession = async (req, res) => {
    try {
        const session = await PomodoroSession.findById(req.params.id);
        if (session.user.toString() !== req.user._id.toString()) {  // toString because with object comparison it was false
            return res.status(403).json({ error: 'This session does not belong to the authenticated user' });
        }

        // Calculate workDuration and workPercentage
        const workDuration = req.body.workDuration;
        const workPercentage = (workDuration / session.totalDuration) * 100;

        Object.assign(session, req.body, {
            workDuration: workDuration,
            workPercentage: workPercentage,
        });   // Update the session with the new data

        await session.save();
        res.json(session);  // Return the updated session
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the session' });
    }
};