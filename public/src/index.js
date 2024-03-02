const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
con
const path = require('path'); // Import the path module

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Connect to MongoDB (replace 'your-mongodb-uri' with your MongoDB connection string)
mongoose.connect('your-mongodb-uri', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a User model
const User = mongoose.model('User', {
  email: String,
  phoneNumber: String,
  password: String,
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Registration route
app.post('/register', async (req, res) => {
  const { email, phoneNumber, password, repeatPassword } = req.body;

  // Check if passwords match
  if (password !== repeatPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Hash the password
  const hashedPassword = await .redirect.hash(password, 10);

  // Create a new user
  const newUser = new User({
    email,
    phoneNumber,
    password: hashedPassword,
  });

  // Save user to the database
  try {
    await newUser.save();
    res.json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving user to the database' });
  }
});

// Serve the registration HTML file
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'uregistration.html'));
});

app.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});