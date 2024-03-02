const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email_id: {
        type: String,
        required: true,
        unique: true,
    },
    phone_no: {
        type: String,
        required: true,
        unique: true,
    },
    experience: {
        type: Number, // Assuming experience is represented as a number of years
        required: true,
    },
     
    password: {
        type: String,
        required: true,
    },
    confirmpassword: {
        type: String,
        required: true,
    }
});

const Trainer_Register = mongoose.model("Trainer_Account", userSchema);

module.exports = Trainer_Register;
