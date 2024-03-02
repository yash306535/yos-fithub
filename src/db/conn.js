const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

// Replace with your MongoDB Cloud URI
const URI = "mongodb+srv://yashvant:yash3005@yos-fithub.ra5uf3v.mongodb.net/?retryWrites=true&w=majority&appName=yos-fithub";

const connectDb = async () => {
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Connection done");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);       
    }
};

const closeDbConnection = async () => {
    await mongoose.connection.close();
    console.log("Connection closed");
};

module.exports = { connectDb, closeDbConnection };
