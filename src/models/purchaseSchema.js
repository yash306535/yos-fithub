// purchaseSchema.js

const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessPlan' },
    purchaseDate: { type: Date, default: Date.now },
    // Add any other fields you need for the purchase
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
