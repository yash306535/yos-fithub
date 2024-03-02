const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    fitnessGoal: { type: String, required: true },
    exerciseFrequency: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    profileImage: { type: String },
    purchasedPlans: [{
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessPlan' },
        trainerEmail: { type: String },
    }],
    // Add any other fields you need for the user profile
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
