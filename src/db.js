// src/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const connectDb = async ()=>{

    try {
        await monggoose.connect(process.env.url)
        console.log("Connction done")
    } catch (error) {
        console.error("Error connecting", error.message) 
    }
}