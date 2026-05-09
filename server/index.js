
const express = require('express'); 
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('./config/passport');
const authRouter = require('./routes/auth');

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Mount: Put '/auth' in front of the routes from routes/auth.js
app.use('/auth', authRouter);

app.get(`/`, (req, res) => {
    res.send("BruinPark API running")
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected");
});


app.listen(port, () =>{
    console.log(`Server listening on Port ${port}`)
});