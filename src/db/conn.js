const mongoose = require("mongoose");

// Replace with your MongoDB Cloud URI
const URI = "mongodb+srv://yashvant:yash3005@yos-fithub.ra5uf3v.mongodb.net/?retryWrites=true&w=majority&appName=yos-fithub";

const connectDb = async () => {
  try {
    await mongoose.connect(URI, {
      // No need for removed options as they are deprecated
    });
    console.log("Connection done");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    // Consider adding more specific error handling here for logging or troubleshooting
  }
};

const closeDbConnection = async () => {
  await mongoose.connection.close();
  console.log("Connection closed");
};

module.exports = { connectDb, closeDbConnection };
