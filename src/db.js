// src/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');


const client = new MongoClient(process.env.url, {
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
