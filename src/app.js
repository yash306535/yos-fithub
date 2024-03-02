const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const router = express.Router();
const connectDb = require("./db/conn");

const Register = require('./models/registers');
const Trainer_Register = require('./models/Trainer_register');
const Profile = require('./models/profile');
const TrainerProfile = require('./models/trainer-profile');
const Feedbacks = require('./models/feedback');
const FitnessPlan = require('./models/trainer_plan'); 
const session = require('express-session');
const Purchase = require('./models/purchaseSchema');
const Progress = require('./models/Progress'); // Update with your actual model file name

const multer = require('multer');
const purchaseRoutes = require('./routes/purchase-routes');
const MongoStore = require('connect-mongo');
const port = process.env.PORT || 3000;
const crypto = require('crypto');
const trainerRoutes = require('./routes/trainer-routes');
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.use(express.static(path.join(__dirname, '../public')));
// Fix the typo in the template path
const template_path = path.join(__dirname, "../templates");
const partial_path = path.join(__dirname, "../templates/partials");
app.use('/api', purchaseRoutes);
// Set up static files and view engine
app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", template_path);
hbs.registerPartials(partial_path);
// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, '.templates'));
app.get('/', (req, res) => {
    res.render('index2'); // Renders the index2.ejs from the 'templates' folder
  });
app.use(
    session({
        secret: 'yash',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb+srv://yashvant:yash3005@yos-fithub.ra5uf3v.mongodb.net/?retryWrites=true&w=majority&appName=yos-fithub' }),
        
    })
);

// const Razorpay = require('razorpay');
// const razorpay = new Razorpay({
//     key_id: 'YOUR_RAZORPAY_KEY_ID',
//     key_secret: 'YOUR_RAZORPAY_KEY_SECRET',
// });

app.use('/trainer', trainerRoutes);
app.get('/plans', async (req, res) => {
    try {
        // Fetch plans from MongoDB
        const plans = await FitnessPlan.find();
        // Render the plans.ejs template with the fetched plans
        res.render('plans', { plans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).send('Failed to fetch plans from the database');
    }
});



// Assuming you have a session variable trainerEmail set during trainer login

// Assuming you have a session variable 'trainerEmail' set during trainer login

// Assuming you have a session variable trainerEmail set during trainer login

app.get('/show-users-buyed-plan', async (req, res) => {
    try {
        const trainerEmail = req.session.trainerEmail;

        // Find all profiles that have purchased plans with the trainer's email
        const users = await Profile.find({
            'purchasedPlans.trainerEmail': trainerEmail
        });

        // Fetch purchased plans for each user
        const usersWithPlans = await Promise.all(users.map(async (user) => {
            const purchasedPlanRecords = user.purchasedPlans.filter(plan => plan.trainerEmail === trainerEmail);
            
            const purchasedPlanIds = purchasedPlanRecords.map(record => record.planId);

            const purchasedPlans = await FitnessPlan.find({ _id: { $in: purchasedPlanIds } });

            return {
                ...user.toJSON(),
                purchasedPlans
            };
        }));

        // Render the show-users-buyed-plan.ejs template and pass users with plans as data
        res.render('show-users-buyed-plan', { users: usersWithPlans, trainerEmail });
    } catch (error) {
        console.error('Error fetching users who bought plans:', error);
        res.status(500).send('Internal Server Error');
    }
});





// Other routes and app configurations

// Assuming you have a session variable for user email set during login
app.post('/buy-plan', async (req, res) => {
    try {
        const userEmail = req.session.email;
        const planId = req.body.planId;
        const trainerEmail = req.body.trainerEmail; // Retrieve trainer's email from the request body

        // Find the user based on the email
        const user = await Profile.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Assuming you have a FitnessPlan model for your plans
        const plan = await FitnessPlan.findById(planId);

        if (!plan) {
            return res.status(404).send('Plan not found');
        }

        // Save the purchase details in user's profile
        user.purchasedPlans.push({
            planId: plan._id,
            trainerEmail,
        });

        await user.save();

        // Save the purchase details in trainer's profile
        const trainer = await TrainerProfile.findOne({ trainerEmail });

        if (trainer) {
            trainer.purchasedUsers.push({
                userId: user._id,
                planId: plan._id,
            });

            await trainer.save();
        }

        res.status(200).send('Plan purchased successfully');
    } catch (error) {
        console.error('Error processing plan purchase:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Assuming you have a session variable 'email' set during user login

app.get('/buyed-plans-user', async (req, res) => {
    try {
        // Fetch user's email from the session
        const userEmail = req.session.email;

        // Find the user based on the email
        const user = await Profile.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fetch purchased plans for the user
        const purchasedPlans = await FitnessPlan.find({ _id: { $in: user.purchasedPlans.map(plan => plan.planId) } });

        // Render the buyed-plans-user.ejs template and pass purchased plans as data
        res.render('buyed-plans-user', { purchasedPlans,userEmail });
    } catch (error) {
        console.error('Error fetching or processing purchased plans:', error);
        res.status(500).send('Internal Server Error');
    }
});





// Mount the router at a specific base path (e.g., /user)
app.use('/user', router);
//fitness plan 
app.post('/trainer_plan', async (req, res) => {
    try {
        const {
            name,
            price,
            diet,
            exercise,
            duration,
            trainer,
            specialDesignedFor,
            ageGroup,
            category,
            intensity,
            requiredEquipment,
            target,
            difficulty,
            frequency,
            benefits,
            trainerEmail
        } = req.body;

        // Create a new instance of the FitnessPlan model
        const newFitnessPlan = new FitnessPlan({
            name,
            price,
            diet,
            exercise,
            duration,
            trainer,
            specialDesignedFor,
            ageGroup,
            category,
            intensity,
            requiredEquipment,
            target,
            difficulty,
            frequency,
            benefits,
            trainerEmail
        });

        // Save the new fitness plan to the database
        await newFitnessPlan.save();

        // Redirect to trainerDashboard upon successful addition
        res.redirect('/trainerDashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/api/plans', async (req, res) => {
    try {
        const plans = await TrainerPlan.find();
        res.json({ plans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans from the database' });
    }
});

module.exports = router;

//user register

app.get("/login", (req, res) => { 
    res.render("login");
});

app.get("/progress-tracking", (req, res) => { 
    res.render("progress-tracking");
});

app.post('/save-progress', async (req, res) => {
    try {
        const userEmail = req.session.email; // Assuming you have user's email in the session

        const {
            date,
            caloriesBurned,
            fatLoss,
            fatGain,
            weightChange,
            dailyActivity,
            weeklyProgress,
        } = req.body;

        const progress = new Progress({
            userEmail,
            date,
            caloriesBurned,
            fatLoss,
            fatGain,
            weightChange,
            dailyActivity,
            weeklyProgress,
        });

        await progress.save();
        res.render('progress-tracking', { success: 'Progress saved successfully' });

    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
// app.js (or wherever your routes are defined)
// In your server-side code
app.get('/user-progress', async (req, res) => {
   res.render("user-progress");
});
app.get('/user-progress-data', async (req, res) => {
    try {
        const userEmail = req.session.email;
        const userProgress = await Progress.find({ userEmail });
        res.json(userProgress);
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/progress-tracking", (req, res) => { 
    res.render("progress-tracking");
});
app.get("/userDashboard", async(req, res) => {
    try {
        // Retrieve user email from the session
        const userEmail = req.session.userEmail;

        // Check if the user is logged in
       
        // Find the user's profile using the email
        const userProfile = await Profile.findOne({ email: userEmail });

        if (userProfile) {
            // Render the userdashboard.ejs template and pass the user's profile
            return res.render('userdashboard', { userProfile });
        } else {
            return res.render('userdashboard', { userProfile });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
app.get('/buyed-plans', async (req, res) => {
    try {
        // Assuming user authentication middleware is in place
        // Fetch user's email from the session
        const userEmail = req.session.email;

        // Find the user based on the email
        const user = await Profile.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fetch purchased plans for the user
        const purchasedPlans = await FitnessPlan.find({ _id: { $in: user.purchasedPlans } });

        // Render the buyed_plans.ejs template and pass purchased plans as data
        res.render('buyed-plans', { purchasedPlans });
    } catch (error) {
        console.error('Error fetching or processing purchased plans:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/trainerdashboard", (req, res) => {
    res.render("trainerdashboard");
});
app.get("/show-users-for-trainer", (req, res) => {
    res.render("show-users-for-trainer");
});
app.get('/trainer_plans_show', async (req, res) => {
    try {
        const trainerName = req.session.trainerName;
        
        // Assuming you have a method to fetch plans by trainerName from the database
        const plans = await FitnessPlan.find({ trainer: trainerName });

        // Render the trainer_plans.ejs template and pass data
        res.render('trainer_plans_show', { trainerName, plans });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/show-trainer-profile', async (req, res) => {
    try {
        // Retrieve the trainer's email from the session
        const trainerEmail = req.session.trainerEmail;

        // Check if the trainer is logged in
        if (!trainerEmail) {
            return res.status(401).send('Unauthorized');
        }

        // Find the trainer profile based on the email
        const trainerProfile = await TrainerProfile.findOne({ trainerEmail });

        if (trainerProfile) {
            // Render the trainer profile page with the profile data
            return res.render('show-trainer-Profile', { trainerProfile });
        } else {
            // Trainer profile not found
            return res.status(404).send('Trainer profile not found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});



app.post("/login", async (req, res) => {
    try {
        const { email_id, password } = req.body;

        // Check if the email exists in the database
        const user = await Register.findOne({ email_id: email_id });

        if (user) {
            // Compare the entered password with the hashed password in the database
            const isPasswordMatch = await compare(password, user.password);

            if (isPasswordMatch) {
                // Passwords match, login successful
                console.log("Login successful");

                // Check if the user has a profile
                const userProfile = await Profile.findOne({ email: user.email_id });

                if (userProfile) {
                    // User profile exists, store user email in the session
                    req.session.userEmail = user.email_id;
                    // Redirect to the dashboard or any desired page
                    return res.redirect("/userDashboard");
                } else {
                    // User profile not found, redirect to the user-profile page
                    return res.redirect("/user-profile");
                }
            } else {
                // Passwords do not match, login failed
                console.log("Incorrect password");
                return res.send('<script>alert("Invalid credentials"); window.location.href = "/login";</script>');
            }
        } else {
            // User with the provided email does not exist
            console.log("User not found");
            return res.send('<script>alert("Invalid credentials"); window.location.href = "/login";</script>');
        }
    } catch (error) {
        console.error(error);
        // Show an alert on the client side for any server error
        return res.send('<script>alert("Internal Server Error"); window.location.href = "/login";</script>');
    }
});




app.get('/show-user-profile', async (req, res) => {
    try {
        // Retrieve user email from the session
        const userEmail = req.session.userEmail;

        // Check if the user is logged in
        if (!userEmail) {
            return res.status(401).send('Unauthorized');
        }

        // Find the user's profile using the email
        const userProfile = await Profile.findOne({ email: userEmail });

        if (userProfile) {
            // Render the show-user-profile.ejs template and pass the user's profile
            return res.render('show-user-profile', { userProfile });
        } else {
            return res.status(404).send('User profile not found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
app.get("/index2",async (req, res) => {
   res.render('index2');
});
app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/trainer-profile", (req, res) => {
    // Retrieve trainerName from session
    const trainerName = req.session.trainerName;
    // const trainerEmail = req.session.trainerEmail;
    // Render the "trainer-profile" page and pass trainerName as a local variable
    res.render("trainer-profile", { trainerName: trainerName,trainerEmail: req.session.trainerEmail,trainerPhone: req.session.trainerPhone});
});


const trainerImgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/trainerimg');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const trainerImgUpload = multer({ storage: trainerImgStorage });

// ... Other routes

app.post('/save-trainer-profile', trainerImgUpload.single('profileImage1'), async (req, res) => {
        const tname=req.session.trainerName;
        const temail=req.session.trainerEmail;

    try {
        const {
            trainerName,
            trainerSpecialization,
            trainerExperience,
            trainerCertification,
            trainerEmail,
            trainerPhone,
            trainerLocation,
            trainerAvailability,
            trainerRate,
            trainerDescription,
        } = req.body;

        const trainerProfile = new TrainerProfile({
            trainerName:tname,
            trainerSpecialization,
            trainerExperience,
            trainerCertification,
            trainerEmail:temail,
            trainerPhone,
            trainerLocation,
            trainerAvailability,
            trainerRate,
            trainerDescription,
            profileImage1: req.file ? req.file.filename : null,
        });

        await trainerProfile.save();

        res.redirect("trainerdashboard");
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
app.get('/show-trainer-to-user/:trainerId', async (req, res) => {
    try {
        // Retrieve the trainer profile using the provided trainerId
        const trainer = await TrainerProfile.findById(req.params.trainerId);

        if (!trainer) {
            // If trainer not found, handle appropriately (redirect to an error page, for example)
            return res.status(404).render('error-page', { message: 'Trainer not found' });
        }

        // Render the show-trainer-to-user.ejs page with the trainer details
        res.render('show-trainer-to-user', { trainer });
    } catch (error) {
        console.error(error);
        // Handle any errors (redirect to an error page, for example)
        res.status(500).render('error-page', { message: 'Internal Server Error' });
    }
});

app.post("/index", async (req, res) => {

    try {
  
        const { email_id, phone_no, password, confirmpassword } = req.body;

        if (password === confirmpassword) {
            // Hash the password before storing it
            const hashedPassword = await hash(password, 10);

            // Create a new Register document
            const newRegister = new Register({
                email_id: req.body.email_id,
                phone_no: req.body.phone_no,
                password: hashedPassword,
                confirmpassword: req.body.password,
            });

            // Save the document to the database
            const registered = await newRegister.save();

            // Check if the registration was successful
            if (registered) {
                console.log("User registration done");
                // Render the index view if registration is successful
               return res.status(201).render("login");
            } else {
                console.log("User registration failed");
                return res.status(500).send("User registration failed");
            }
        } else {
           return res.status(400).send("Passwords do not match");
        }
    } catch (error) {
        console.error(error);
        
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/calculator1", (req, res) => {
    res.render("calculator1");
});
app.get("/about-us", (req, res) => {
    res.render("about-us");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});
app.get("/alogin", (req, res) => {

    res.render("alogin");
});
app.get("/ll", (req, res) => {
    res.render("ll");
});
app.get("/add_plan", async (req, res) => {
    // Assuming that the trainer's name is stored in the session under the key "trainerName"
    const trainerName = req.session.trainerName;
    const trainerEmail= req.session.trainerEmail;
    res.render("add_plan", { trainerName, trainerEmail });
});

app.get('/trainer_buyed_user', async (req, res) => {
    try {
        // Get the logged-in trainer's email from the session
        const trainerEmail = req.session.trainerEmail;

        // Find the trainer based on the email
        const trainer = await TrainerProfile.findOne({ trainerEmail });

        if (!trainer) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        // Find the purchases for the trainer's plans
        const buyedUsers = await Purchase.find({ trainerId: trainer._id }).populate('userId');

        // Render the trainer's buyed users page with the buyedUsers data
        res.render('trainer_buyed_user', { buyedUsers ,trainer});
    } catch (error) {
        console.error('Error fetching buyed users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post("/ll", async (req, res) => {
    try {
        const { email_id, password } = req.body;

        // Check if the email exists in the database
        const trainer = await Trainer_Register.findOne({ email_id: email_id });

        if (trainer) {
            // Compare the provided password with the hashed password stored in the database
            const isPasswordMatch = await compare(password, trainer.password);

            if (isPasswordMatch) {
                const userProfile = await TrainerProfile.findOne({ email: trainer.email_id });
                // Set session variables for authenticated trainer
                req.session.trainerEmail = trainer.email_id;
                req.session.trainerName = trainer.name;
                req.session.trainerPhone = trainer.phone_no;
                console.log("Trainer Login successful");

                // Check if trainer profile is set
                if (userProfile) {
                    // Redirect to the trainer-profile page to set up the profile
                    return res.redirect("/trainer-profile");
                }
                else{
                    return res.redirect("/trainerdashboard");

                }
                // Redirect to the trainer dashboard
            } else {
                console.log("Incorrect password");
                // Send a script to show an alert and stay on the current page
                return res.send('<script>alert("Incorrect password"); window.location.href = "/ll";</script>');
            }
        } else {
            console.log("Trainer not found");
            // Send a script to show an alert and stay on the current page
            return res.send('<script>alert("Trainer not found"); window.location.href = "/ll";</script>');
        }
    } catch (error) {
        console.error(error);
        // Send a script to show an alert and stay on the current page
        return res.status(500).send('<script>alert("Internal Server Error: ' + error.message + '"); window.location.href = "/ll";</script>');
    }
});


        






app.get("/blog-deatails", (req, res) => {
    res.render("blog-deatails");
});
app.get("/blog", (req, res) => {
    res.render("blog");
});
app.get("/bmi-calculator", (req, res) => {
    res.render("bmi-calculator");
});
app.get("/calculator", (req, res) => {
    res.render("calculator");
});
app.get("/class-details", (req, res) => {
    res.render("class-deatails");
});
app.get("/class-timetable", (req, res) => {
    res.render("class-timetable");
});
app.get("/contact", (req, res) => {
    res.render("contact");
});



  
app.get("/user-profile", (req, res) => {
    res.render("user-profile");
});
app.get("/create-profile", (req, res) => {
    res.render("create-profile");
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });
// Save user profile route
app.post('/save-profile', upload.single('profileImage'), async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            email,
            phone,
            height,
            weight,
            fitnessGoal,
            exerciseFrequency,
            experienceLevel,
        } = req.body;

        const userProfile = new Profile({
            name,
            age,
            gender,
            email,
            phone,
            height,
            weight,
            fitnessGoal,
            exerciseFrequency,
            experienceLevel,
            profileImage: req.file ? `${req.file.filename}` : null, // Adjust the path accordingly
        });

        await userProfile.save();

        return res.status(201).send('User profile saved successfully');
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Duplicate email error
            return res.status(400).send('Email already exists. Please use a different email.');
        }

        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get("/feedback1", (req, res) => {
    res.render("feedback1");
});
app.get('/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedbacks.find();
        res.json(feedbacks);
    } catch (err) {
        console.error('Error fetching feedbacks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post("/feedback1", async (req, res) => {

    try {
  
        const { name,email ,contact, feedback, rating } = req.body;

      
            // Hash the password before storing it
           

            // Create a new Register document
            const newRegister = new Feedbacks({
                name: req.body.name,
                email: req.body.email,
                contact:req.body.contact,
                feedback: req.body.feedback,
                rating: req.body.rating
            });

            // Save the document to the database
            const registered = await newRegister.save();

            // Check if the registration was successful
            if (registered) {
                console.log("complete");
                // Render the index view if registration is successful
               return res.status(201).render("index2");
            } else {
                console.log("User feed failed");
                return res.status(500).send("User feed failed");
            }
        }
     catch (error) {
        console.error(error);
        
        return res.status(500).send("Internal Server Error");
    }
});
app.get("/main", (req, res) => {
    res.render("main");
});
app.get("/plans", (req, res) => {
    res.render("plans");
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/services", (req, res) => {
    res.render("services");
});
app.get("/team", (req, res) => {
    res.render("team");
});
app.get("/trainer", (req, res) => {
    res.render("trainer");
});
app.get('/trainer1', async (req, res) => {
    try {
        const trainers = await TrainerProfile.find();
        res.render('trainer1', { trainers: trainers });
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/trainer_reg", (req, res) => {
    res.render("trainer_reg");
});

app.get("/index2", (req, res) => {
    res.render("index2");
});
//tainer register
app.post("/trainer_reg", async (req, res) => {
    
    try {
  
        const { name,email_id, phone_no,experience,certificates, password, confirmpassword } = req.body;

        if (password === confirmpassword) {
            // Hash the password before storing it
            const hashedPassword = await bhash(password, 10);

            // Create a new Register document
            const newRegister = new Trainer_Register({
                name:req.body.name,
                email_id: req.body.email_id,
                phone_no: req.body.phone_no,
                experience:req.body.experience,
    
                password: hashedPassword,
                confirmpassword: req.body.password,
            });

            // Save the document to the database
            const registered = await newRegister.save();

            // Check if the registration was successful
            if (registered) {
                console.log("Trainer registration done");
                // Render the index view if registration is successful
               return res.status(201).render("ll");
            } else {
                console.log("Trainer registration failed");
                return res.status(500).send("User registration failed");
            }
        } else {
           return res.status(400).send("Passwords do not match");
        }
    } catch (error) {
        console.error(error);
        
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

connectDb.connectDb();

// Your other app configurations and routes go here...

// Close MongoDB connection on process termination
process.on("SIGINT", async () => {
    await connectDb.closeDbConnection();
    process.exit(0);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
