const mongoose = require("mongoose");
const URI=mongoose.connect("mongodb://127.0.0.1:27017/gym");
URI.then(()=>{
console.log("Database connected");
})
.catch(()=>{
console.log("not connected");
});
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

