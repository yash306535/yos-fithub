// trainer-routes.js

const express = require('express');
const router = express.Router();
const TrainerProfile = require('../models/trainer-profile');
const Purchase = require('../models/purchaseSchema');
const { isLoggedIn } = require('../middlewares/auth'); // Assuming you have an authentication middleware

router.use(isLoggedIn);

// Route to show users who bought the trainer's plans
router.get('/trainer-buyed-users', async (req, res) => {
    try {
        // Get the logged-in trainer's email from the session
        const trainerEmail = req.session.trainerEmail;

        // Find the trainer based on the email
        const trainer = await TrainerProfile.findOne({ trainerEmail });

        if (!trainer) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        // Find the purchases for the trainer's plans and populate user details
        const buyedUsers = await Purchase.find({ trainerId: trainer._id }).populate('userId');

        // Render the trainer's buyed users page with the buyedUsers data
        res.render('trainer-buyed-users', { buyedUsers, trainer }); // Pass the trainer details to the template
    } catch (error) {
        console.error('Error fetching buyed users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
