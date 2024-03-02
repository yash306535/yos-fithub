// routes/buyed-plans.js

const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const FitnessPlan = require('../models/trainer_plan'); // Update this line with your actual model file name
const { isLoggedIn } = require('../middlewares/auth');

router.use(isLoggedIn);

router.get('/buyed-plans-user', async (req, res) => {
    try {
        // Assuming user authentication middleware is in place
        // Fetch user's email from the session
        const userEmail = req.session.email;

        // Find the user based on the email
        const user = await Profile.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fetch purchased plans for the user
        const purchasedPlans = await FitnessPlan.find({ _id: { $in: user.purchasedPlans.map(plan => plan.planId) } });

        // Render the buyed-plans-user.ejs template and pass purchased plans as data
        res.render('buyed-plans-user', { purchasedPlans });
    } catch (error) {
        console.error('Error fetching or processing purchased plans:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
