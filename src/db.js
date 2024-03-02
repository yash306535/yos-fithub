// src/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://yashvant:yash3005@yos-fithub.ra5uf3v.mongodb.net/?retryWrites=true&w=majority&appName=yos-fithub";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

async function close() {
  await client.close();
  console.log("Connection to MongoDB closed");
}

module.exports = { connect, close };
