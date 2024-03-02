const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB connection string)
mongoose.connect('your_database_url', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a mongoose model for User
const User = mongoose.model('User', {
  email: String,
  phoneNumber: String,
  password: String,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., your HTML, CSS, and JS files)
app.use(express.static('public'));

// Handle user registration
app.post('/register', async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Create a new user
    const newUser = new User({
      email,
      phoneNumber,
      password,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://gymhost:${port}`);
});
