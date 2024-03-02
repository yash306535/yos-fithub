// routes/purchase-routes.js
const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchaseSchema');
const { isLoggedIn } = require('../middlewares/auth');

router.use(isLoggedIn);

// Route to handle plan purchase
router.post('/buy-plan', async (req, res) => {
    try {
        const { planId } = req.body; // Assuming planId is sent in the request body
        const userId = req.session.userId; // Assuming userId is stored in the session

        // Create a new purchase record
        const purchaseRecord = await Purchase.create({
            userId,
            planId,
            // You can add other details like purchase date, amount, etc.
        });

        // Redirect the user to a confirmation page or dashboard
        res.redirect('/dashboard'); // Adjust the redirect path based on your routes
    } catch (error) {
        console.error('Error during plan purchase:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
