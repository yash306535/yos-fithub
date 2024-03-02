// middlewares/auth.js

const isLoggedIn = (req, res, next) => {
    // Your authentication logic here
    // For example, you can check if the user is logged in based on your session implementation
    if (req.session && req.session.userEmail) {
        // User is authenticated, call next to proceed to the next middleware or route handler
        next();
    } else {
        // User is not authenticated, redirect to login or handle the situation accordingly
        res.redirect('/login'); // Adjust the redirect path based on your routes
    }
};

module.exports = { isLoggedIn };
