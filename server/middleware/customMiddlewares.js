/* future middlewares, not yet implemented in the project */
/* 21/04/2024 */

// Middleware to handle errors
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}

module.exports = { errorHandler };