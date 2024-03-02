const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userEmail: { type: String, required: true }, // Assuming you have a user's email associated with the progress
    date: { type: Date, required: true },
    caloriesBurned: { type: Number },
    fatLoss: { type: Number },
    fatGain: { type: Number },
    weightChange: { type: Number },
    dailyActivity: { type: Number, min: 1, max: 10, required: true },
    weeklyProgress: { type: String },
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
