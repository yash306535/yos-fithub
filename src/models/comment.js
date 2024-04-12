const mongoose = require('mongoose');

// Define the schema for the Comment model
const commentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Comment model using the schema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
