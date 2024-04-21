/* future middlewares, not yet implemented in the project */
/* 21/04/2024 */

// Middleware to log request info
function logRequest(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}

// Middleware to handle errors
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}

// Middleware to check authentication
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = { logRequest, errorHandler, checkAuthentication };