// Middleware to handle errors
// Not currently used in the project
// function errorHandler(err, req, res, next) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
// }

// Middleware to ensure that the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {    // passport function
        return next();
    }
    return res.status(401).json({ error: 'Not authenticated' });
}

// // Middleware to check if the user owns a certain item
// const checkOwnership = (Model) => async (req, res, next) => {
//     try {
//         const item = await Model.findById(req.params.id);
//         if (!item) {
//             return res.status(404).send('Item not found');
//         }
//         if (item.user.toString() !== req.user._id.toString()) { // Convert the ObjectID to a string
//             return res.status(403).send('Access denied');
//         }
//         req.item = item; // Add the item to the request object
//         next(); // Continue to the next middleware function or route handler
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error in checkOwnership middleware');
//     }
// };

module.exports = { ensureAuthenticated };