const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const router = express.Router();
const connectDb = require("./db/conn");
const Admin = require('./models/admin');
const Register = require('./models/registers');
const Trainer_Register = require('./models/Trainer_register');
const Profile = require('./models/profile');
const TrainerProfile = require('./models/trainer-profile');
const Feedbacks = require('./models/feedback');
const FitnessPlan = require('./models/trainer_plan'); 
const session = require('express-session');
const Purchase = require('./models/purchaseSchema');
const Progress = require('./models/Progress'); // Update with your actual model file name
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Adjusted path
const Comment = require('./models/comment');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://yos-fithub-5c0ee.appspot.com/trainerImages'
  });
const multer = require('multer');
const MongoStore = require('connect-mongo');
const port = process.env.PORT || 5000;
const trainerRoutes = require('./routes/trainer-routes');
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.use(express.static(path.join(__dirname, '../public')));
// Fix the typo in the template path
const template_path = path.join(__dirname, "../templates");
const partial_path = path.join(__dirname, "../templates/partials");
// Set up static files and view engine
app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", template_path);
hbs.registerPartials(partial_path);
// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, '../templates'));

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: 'rzp_live_2ZbLICnvIdASq6',
    key_secret: 'Yo9X3SUMAtgJQ0qiVrFox3Z1',
});

app.post('/submit-comment', async (req, res) => {
    try {
        const { name, email, website, comment } = req.body;

        // Create a new comment document
        const newComment = new Comment({
            name,
            email,
            website,
            comment
        });

        // Save the comment to the database
        await newComment.save();

        // Send a success response
        res.status(201).json({ message: 'Comment submitted successfully' });
    } catch (error) {
        console.error('Error submitting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/about-us', async (req, res) => {
    try {
        // Fetch feedbacks from the database
        const feedbacks = await Feedbacks.find();
        
        res.render('about-us', { feedbacks });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/../Video-Call-App-NodeJS-master/src/index.html', (req, res) => {
    // Render the "v_call.ejs" file in the "templates" directory
    res.render('../Video-Call-App-NodeJS-master/src/index.html');
});
app.get('/', (req, res) => {
    res.redirect('index2'); // Renders the index2.ejs from the 'templates' folder
  });

app.use(
    session({
        secret: 'yash',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb+srv://yashvant:yash3005@yos-fithub.ra5uf3v.mongodb.net/?retryWrites=true&w=majority&appName=yos-fithub' }),
        
    })
);

router.get('/check-plan-purchase', async (req, res) => {
    try {
        const { planId } = req.query;
        const { userEmail } = req.session;

        // Find the user's profile
        const user = await Profile.findOne({ email: userEmail });

        // Check if the user has purchased the plan
        const alreadyPurchased = user.purchasedPlans.some(plan => plan.planId.equals(planId));

        // Send response indicating whether the plan has been purchased
        res.json({ alreadyPurchased });
    } catch (error) {
        console.error('Error checking plan purchase:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
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

app.get('/u_trainer1', async (req, res) => {
    try {
        const trainers = await TrainerProfile.find();
        res.render('u_trainer1', { trainers: trainers });
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).send('Internal Server Error');
    }
});
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
app.post('/create-razorpay-order', async (req, res) => {
    try {
        const planId = req.body.planId;
        const trainerEmail = req.body.trainerEmail;

        // Fetch details of the plan from the database (e.g., price) if needed
        const plan = await FitnessPlan.findById(planId);

        // Calculate amount (convert price to paise)
        const amount = plan.price * 100;

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount,
            currency: 'INR',
            receipt: 'receipt_order_' + planId,
            notes: {
                planId: planId,
                trainerEmail: trainerEmail,
            },
        });

        res.json({ id: order.id, amount: amount });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/buy-plan', async (req, res) => {
    try {
        const userEmail = req.session.userEmail;
        const planId = req.body.planId;
        const trainerEmail = req.body.trainerEmail;

        console.log('User Email:', userEmail);
        console.log('Plan ID:', planId);
        console.log('Trainer Email:', trainerEmail);

        const user = await Profile.findOne({ email: userEmail });
        console.log('User:', user);
        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        const plan = await FitnessPlan.findById(planId);
        console.log('Plan:', plan);
        if (!plan) {
            console.log('Plan not found');
            return res.status(404).send('Plan not found');
        }

        if (user.purchasedPlans.some(purchasedPlan => purchasedPlan.planId.equals(plan._id))) {
            console.log('User already purchased this plan');
            return res.status(400).json({ warning: 'You have already purchased this plan. You cannot buy the same plan again.' });
        }

        user.purchasedPlans.push({
            planId: plan._id,
            trainerEmail,
        });

        await user.save();
        console.log('User saved successfully');

        let trainer = await TrainerProfile.findOne({ trainerEmail });
        console.log('Trainer:', trainer);

        if (!trainer) {
            console.log('Creating a new TrainerProfile document');
            // Create a new TrainerProfile document if it doesn't exist
            trainer = new TrainerProfile({ trainerEmail });
        }

        trainer.purchasedUsers.push({
            userId: user._id,
            planId: plan._id,
        });

        await trainer.save();
        console.log('Trainer saved successfully');

        res.status(200).json({ success: true, message: 'Plan purchased successfully' });
    } catch (error) {
        console.error('Error processing plan purchase:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});








app.get('/buyed-plans-user', async (req, res) => {
    try {
        // Fetch user's email from the session
        const userEmail = req.session.userEmail;

        // Find the user based on the email
        const user = await Profile.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fetch purchased plans for the user
        const purchasedPlanIds = user.purchasedPlans.map(plan => plan.planId);
        
        const purchasedPlans = await FitnessPlan.find({ _id: { $in: purchasedPlanIds } });

        // Render the 'buyed-plans' template and pass purchased plans as data
        res.render('buyed-plans-user', { purchasedPlans, userEmail });
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

        // Validate if all required fields are provided
        if (!name || !price || !duration || !trainer || !trainerEmail) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

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
app.get("/u_register", (req, res) => { 
    res.render("u_register");
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
            userEmail:userEmail,
            date,
            caloriesBurned,
            fatLoss,
            fatGain,
            weightChange,
            dailyActivity,
            weeklyProgress,
        });

        await progress.save();
        res.redirect('/progress-tracking?success=Progress saved successfully');

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
            return res.render('userDashboard', { userProfile });
        } else {
            return res.render('userDashboard', { userProfile });
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
            return res.render('show-trainer-profile', { trainerProfile });
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
            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (isPasswordMatch) {
                // Passwords match, login successful

                // Check if the user has a profile
                const userProfile = await Profile.findOne({ email: user.email_id });
                console.log("login successful");
                if (userProfile) {
                    // User profile exists, store user email in the session
                    req.session.userEmail = user.email_id;
                    // Redirect to the dashboard or any desired page
                    console.log("login successful");

                    return res.redirect("/userDashboard");

                } else {
                    // User profile not found, redirect to the user-profile page
                    console.log("login successful");

                    return res.redirect("/user-profile");

                }
            } else {
                console.log("login insuccessful");

                // Passwords do not match, login failed
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        } else {
            console.log("login insuccessful");

            // User with the provided email does not exist
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log("login insuccessful");

        console.error(error);
        // Show an alert on the client side for any server error
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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

const trainerImgStorage = multer.memoryStorage(); // Store file in memory for Firebase upload
const trainerImgUpload = multer({ storage: trainerImgStorage });


// Route for saving trainer profile with image upload
app.post('/save-trainer-profile', trainerImgUpload.single('profileImage1'), async (req, res) => {
    const tname = req.session.trainerName;
    const temail = req.session.trainerEmail;
  
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
  
      // Check if file was uploaded
      if (!req.file) {
        throw new Error('No image uploaded');
      }
  
      // Upload image to Firebase Storage
      const bucket = admin.storage().bucket();
      const filename = 'trainerImages/' + req.file.originalname;
      const file = bucket.file(filename);
      console.log(req.file);

      await file.save(req.file.buffer, { contentType: req.file.mimetype });
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  
      // Save trainer profile with image URL
      const trainerProfile = new TrainerProfile({
        trainerName: tname,
        trainerSpecialization,
        trainerExperience,
        trainerCertification,
        trainerEmail: temail,
        trainerPhone,
        trainerLocation,
        trainerAvailability,
        trainerRate,
        trainerDescription,
        profileImage1: imageUrl
      });
  
      await trainerProfile.save();
  
      res.redirect("trainerdashboard");
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).send('Internal Server Error');
    }
  });
  
  

app.get('/trainers', async (req, res) => {
    try {
        // Fetch trainers with their purchased plans
        const trainers = await TrainerProfile.find().populate('purchasedUsers.userId');

        // Render the EJS template passing trainers data
        res.render('trainers', { trainers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
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

       

        // Hash the password
        const saltRounds = 10; // You can adjust the number of salt rounds
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new Register({
            email_id,
            phone_no,
            password: hashedPassword,
            confirmpassword: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Redirect or respond as needed
        res.render('login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
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
app.post('/alogin', async (req, res) => {
    const { email, pass } = req.body;

    try {
        const admin = await Admin.findOne({ email: email, password: pass });

        if (admin) {
            // If admin found, redirect to admin dashboard
            res.redirect('/admin_dashboard');
        } else {
            // If admin not found, redirect back to login page
            res.redirect('/alogin');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/admin_dashboard", (req, res) => {
    res.render("admin_dashboard"); // Assuming you're using a view engine like EJS or Pug
});

app.get("/add_plan", async (req, res) => {
    // Assuminthe trainer's name is stored in the session under the key "trainerName"
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
            const isPasswordMatch = await bcrypt.compare(password, trainer.password);

            if (isPasswordMatch) {
                const trainer1 = await Trainer_Register.findOne({ email_id: email_id });
                // Set session variables for authenticated trainer
                req.session.trainerEmail = trainer.email_id;
                req.session.trainerName = trainer.name;
                req.session.trainerPhone = trainer.phone_no;

                // Check if trainer profile is set
                if (!trainer1) {
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

        return res.status(201).render('userDashboard');
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Duplicate email error
            return res.status(400).send('Email already exists. Please use a different email.');
        }

        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get("/feedback1", async (req, res) => {
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

app.get('/trainer_for_admin', async (req, res) => {
    try {
        const trainers = await TrainerProfile.find();
        res.render('trainer_for_admin', { trainers: trainers });
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
  
        const { name,email_id, phone_no,password, confirmpassword } = req.body;

        if (password === confirmpassword) {
            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new Register document
            const newRegister = new Trainer_Register({
                name:req.body.name,
                email_id: req.body.email_id,
                phone_no: req.body.phone_no,
                password: hashedPassword,
                confirmpassword: req.body.password,
            });

            // Save the document to the database
            const registered = await newRegister.save();

            // Check if the registration was successful
            if (registered) {
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
