const mongoose = require("mongoose");

const fitnessPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    diet: {
        type: String,
        required: true
    },
    exercise: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    trainer: {
        type: String,
        required: true
    },
    specialDesignedFor: {
        type: String,
        required: true
    },
    ageGroup: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    intensity: {
        type: String,
        required: true
    },
    requiredEquipment: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    benefits: {
        type: String,
        required: true
    },
    trainerEmail: {
        type: String,
        required: true,
      
    },
});

// Create a model using the schema
const FitnessPlan = mongoose.model('FitnessPlan', fitnessPlanSchema);

module.exports = FitnessPlan;
