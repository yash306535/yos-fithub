const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true,
    },
    confirmpassword: {
        type: String,
        required: true,
    }
});

const Register = mongoose.model("UserDetails", userSchema);

module.exports = Register;

