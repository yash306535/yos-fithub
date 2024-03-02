const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
       
    },
    email: {
        type: String,
        required: true,
        
    },
    contact: {
        type: Number,
        required: true,
       
    },
    feedback :{
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    }
});

const Feedbacks = mongoose.model("Feedback", userSchema);

module.exports = Feedbacks;

