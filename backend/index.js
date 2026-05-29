
const express = require('express'); 
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const cors = require('cors');

dotenv.config();

// Route imports
const passport = require('./config/passport');
const authRouter = require('./routes/auth');
const requireAuth = require('./middleware/requireAuth');
const postRoutes = require('./routes/posts');
const verifyRoutes = require('./routes/verify');

const app = express();
const port = 3001;

app.use(cors({
    origin: process.env.CLIENT_URI,
    credentials: true
}));

app.use(express.json());


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI}),
    cookie: {
        httpOnly: true,
        maxAge: 604800000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get(`/`, (req, res) => {
    res.send("BruinPark API running")
});

// Mount: Put '/auth' in front of the routes from routes/auth.js
app.use('/auth', authRouter);
app.use('/api/posts', postRoutes);
app.use('/api/verify', verifyRoutes);

app.get('/api/protected', requireAuth, (req, res) => {
    res.json({message: `Hello ${req.user.name}, you are authenticated.`})
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error", err.message));


app.listen(port, () =>{
    console.log(`Server listening on Port ${port}`)
});