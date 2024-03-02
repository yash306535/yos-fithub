const mongoose = require('mongoose');

const trainerProfileSchema = new mongoose.Schema({
    trainerName: { type: String },
    trainerSpecialization: { type: String, required: true },
    trainerExperience: { type: Number, required: true },
    trainerCertification: { type: String, required: true },
    trainerEmail: { type: String, required: true, unique: true },
    trainerPhone: { type: String },
    trainerLocation: { type: String, required: true },
    trainerAvailability: { type: String, required: true },
    trainerRate: { type: Number, required: true },
    trainerDescription: { type: String, required: true },
    profileImage1: { type: String },
    purchasedUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
            planId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessPlan' },
        }
    ]
    // Add any other fields you need for the trainer profile
});

const TrainerProfile = mongoose.model('TrainerProfile', trainerProfileSchema);

module.exports = TrainerProfile;
