// routes/get-purchased-plans.js

const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const FitnessPlan = require('../models/trainer_plan');
const Purchase = require('../models/purchaseSchema');
const { isLoggedIn } = require('../middlewares/auth');

router.use(isLoggedIn);

router.get('/get-purchased-plans', async (req, res) => {
    try {
        const userEmail = req.session.email;
        const user = await Profile.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch purchased plans for the user from the Purchase collection
        const purchaseRecords = await Purchase.find({ userId: user._id });
        const purchasedPlanIds = purchaseRecords.map(record => record.planId);

        // Find the plans associated with the purchasedPlanIds
        const purchasedPlans = await FitnessPlan.find({ _id: { $in: purchasedPlanIds } });

        res.json(purchasedPlans);
    } catch (error) {
        console.error('Error fetching purchased plans:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
